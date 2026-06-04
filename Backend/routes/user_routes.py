from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from werkzeug.security import check_password_hash,generate_password_hash

from models import (
    db, User, Student, Supervisor, Project_Pitch,
    Supervisor_Interest, Research_Tag, Student_Submission,
    Submission_Attachment, Milestone, Coordinator
)

user_bp = Blueprint('users', __name__)

GOOGLE_CLIENT_ID = "1007402569571-7s9h5cb32gfkf4atjpp5svgpt8tnalmr.apps.googleusercontent.com"

# ==========================================
# 1. GOOGLE LOGIN
# ==========================================
@user_bp.route('/auth/google', methods=['POST'])
def google_login():
    token = request.json.get('token')
    if not token:
        return jsonify({"status": "error", "message": "No token provided"}), 400
 
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
 
        google_id  = idinfo['sub']
        email      = idinfo['email'].lower() # Ensure lowercase matching
        first_name = idinfo.get('given_name', '')
        last_name  = idinfo.get('family_name', '')
 
        # --- THE SOLE MASTER KEY ---
        # Change this to whichever email you want as your ultimate system Admin
        MASTER_ADMIN_EMAIL = 'smmx2005@gmail.com' 
 
        user = User.query.filter_by(email=email).first()
 
        if not user:
            # ── STRICT ACCESS CONTROL ─────────────────────────────
            # If the email is NOT in the database AND it is NOT the Master Admin, reject immediately!
            if email != MASTER_ADMIN_EMAIL:
                return jsonify({
                    "status": "error",
                    "message": "Access denied. Your email has not been registered in the system by an Administrator."
                }), 403
            # ──────────────────────────────────────────────────────────────
            
            # Only the Master Admin reaches this point. Auto-create their account so they are never locked out.
            user = User(
                google_id=google_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                user_role='Administrator',
                account_status='Accepted',
                password=None
            )
            db.session.add(user)
            db.session.flush()
 
        else:
            # Existing user (Uploaded via CSV or returning Admin)
            if not user.google_id:
                user.google_id = google_id
 
            # Force the Master Admin to always be an Administrator (Security fallback)
            if email == MASTER_ADMIN_EMAIL and user.user_role != 'Administrator':
                user.user_role = 'Administrator'
                user.account_status = 'Accepted'
 
            # Activate ANY role that is still 'Pending' (from CSV upload)
            if user.account_status == 'Pending':
                user.account_status = 'Accepted'
 
            db.session.flush()
 
        # ── AUTO-HEAL PROFILES ─────────────────────────────────────────────
        # Supervisor / Coordinator profile setup
        if user.user_role in ('Supervisor', 'Coordinator'):
            sup = Supervisor.query.filter_by(user_id=user.user_id).first()
            if not sup:
                sup = Supervisor(
                    user_id=user.user_id,
                    max_2nd_year_capacity=5,
                    max_4th_year_capacity=5,
                    onboarding_complete=False # Make them complete their own setup
                )
                db.session.add(sup)
                db.session.flush()
 
            if user.user_role == 'Coordinator':
                coord = Coordinator.query.filter_by(supervisor_id=sup.supervisor_id).first()
                if not coord:
                    new_coord = Coordinator(supervisor_id=sup.supervisor_id, year='4')
                    db.session.add(new_coord)
 
        # Student profile setup
        if user.user_role == 'Student':
            student = Student.query.filter_by(user_id=user.user_id).first()
            if not student:
                placeholder = Student(
                    user_id=user.user_id,
                    registration_number="Not Set",
                    year='2',
                    onboarding_complete=False
                )
                db.session.add(placeholder)
 
        db.session.commit()
        # ──────────────────────────────────────────────────────────────────
 
        access_token = create_access_token(identity=str(user.user_id))
 
        # Build coordinator_year so the frontend dashboard title is correct
        coordinator_year = None
        if user.user_role == 'Coordinator':
            sup = Supervisor.query.filter_by(user_id=user.user_id).first()
            if sup:
                coord = Coordinator.query.filter_by(supervisor_id=sup.supervisor_id).first()
                if coord:
                    coordinator_year = coord.year
 
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.user_role,
                "first_name": user.first_name,
                "coordinator_year": coordinator_year
            }
        }), 200
 
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid Google token"}), 401
    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== GOOGLE LOGIN ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500
# ==========================================
# 2. MANUAL LOGIN (Staff/Admins only)
# ==========================================
@user_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.user_role == 'Student':
        return jsonify({
            "status": "error",
            "message": "Students must log in using the Google button above."
        }), 403

    if user and not user.password:
        return jsonify({
            "status": "error",
            "message": "Account not fully set up. Please use the 'Forgot Password' link to set your password."
        }), 403

    if user and check_password_hash(user.password, password):
        # Build coordinator_year for the frontend
        coordinator_year = None
        if user.user_role == 'Coordinator':
            sup = Supervisor.query.filter_by(user_id=user.user_id).first()
            if sup:
                coord = Coordinator.query.filter_by(supervisor_id=sup.supervisor_id).first()
                if coord:
                    coordinator_year = coord.year

        access_token = create_access_token(identity=str(user.user_id))
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": {
                "role": user.user_role,
                "email": user.email,
                "first_name": user.first_name,
                "coordinator_year": coordinator_year
            }
        }), 200

    return jsonify({"status": "error", "message": "Invalid email or password"}), 401


# ==========================================
# 3. GET PROFILE
# ==========================================
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return jsonify({
        "status": "success",
        "data": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.user_role,
            "status": user.account_status
        }
    }), 200


# ==========================================
# 4. GET ALL FACULTY
# ==========================================
@user_bp.route('/faculty', methods=['GET'])
@jwt_required()
def get_all_faculty():
    faculty_members = User.query.filter(User.user_role != 'Student').all()
    faculty_data = []
    for user in faculty_members:
        faculty_data.append({
            "id": user.user_id,
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "phone": user.phone_number,
            "role": user.user_role,
            "status": user.account_status,
            "suspension_reason": user.suspension_reason
        })
    return jsonify({"status": "success", "data": faculty_data}), 200


# ==========================================
# 5. GET ALL STUDENTS
# ==========================================
@user_bp.route('/students', methods=['GET'])
@jwt_required()
def get_all_students():
    students = User.query.filter_by(user_role='Student').all()
    student_data = []
    for user in students:
        student_profile = Student.query.filter_by(user_id=user.user_id).first()
        student_data.append({
            "id": user.user_id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "phone": user.phone_number,
            "status": user.account_status,
            "suspension_reason": user.suspension_reason,
            "reg": student_profile.registration_number if student_profile else "Not Set",
            "year": student_profile.year if student_profile else "2"
        })
    return jsonify({"status": "success", "data": student_data}), 200


# ==========================================
# 6. UPDATE USER DETAILS
# ==========================================
@user_bp.route('/update/<int:target_user_id>', methods=['PUT'])
@jwt_required()
def update_user_details(target_user_id):
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        data = request.get_json()

        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone_number = data['phone']
        if 'name' in data:
            name_parts = data['name'].split()
            user.first_name = name_parts[0] if name_parts else user.first_name
            user.last_name  = " ".join(name_parts[1:]) if len(name_parts) > 1 else user.last_name

        if user.user_role == 'Student':
            student_record = Student.query.filter_by(user_id=user.user_id).first()
            if not student_record:
                student_record = Student(user_id=user.user_id, registration_number="Not Set", year='2')
                db.session.add(student_record)
                db.session.flush()
            if 'reg' in data:
                student_record.registration_number = data['reg']
            if 'year' in data:
                student_record.year = str(data['year'])

        db.session.commit()
        return jsonify({"status": "success", "message": "Account details updated successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ UPDATE FAILED FOR USER {target_user_id}: {str(e)}\n")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500


# ==========================================
# 7. SUSPEND USER
# ==========================================
@user_bp.route('/suspend/<int:target_user_id>', methods=['PATCH'])
@jwt_required()
def suspend_user(target_user_id):
    user = User.query.get(target_user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    data   = request.get_json()
    reason = data.get('reason')
    if not reason:
        return jsonify({"status": "error", "message": "Suspension reason is required"}), 400

    user.account_status   = 'Suspended'
    user.suspension_reason = reason

    try:
        db.session.commit()
        return jsonify({"status": "success", "message": f"Account for {user.first_name} has been suspended."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to update account status."}), 500


# ==========================================
# 8. UNSUSPEND USER
# ==========================================
@user_bp.route('/unsuspend/<int:target_user_id>', methods=['PATCH'])
@jwt_required()
def unsuspend_user(target_user_id):
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        user.account_status    = 'Accepted'
        user.suspension_reason = None

        db.session.commit()
        return jsonify({"status": "success", "message": f"Account for {user.first_name} has been restored."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ UNSUSPEND FAILED FOR USER {target_user_id}: {str(e)}\n")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500
# ==========================================
# 1. GET CURRENT USER PROFILE
# ==========================================
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_user_profile():      # <--- CHANGE THIS NAME HERE
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        data = {
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "phoneNumber": user.phone_number or "",
            "role": user.user_role,
            "status": user.account_status
        }
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 2. UPDATE PROFILE DETAILS
# ==========================================
@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        data = request.get_json()

        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        # Check if the new email is already taken by someone else
        new_email = data.get('email')
        if new_email and new_email != user.email:
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user:
                return jsonify({"status": "error", "message": "Email is already in use."}), 400
            user.email = new_email

        # Update other allowed fields
        if data.get('firstName'):
            user.first_name = data.get('firstName')[:25] # Model limit is 25
        if data.get('lastName'):
            user.last_name = data.get('lastName')[:25]   # Model limit is 25
        if 'phoneNumber' in data:
            # Strip spaces to ensure it fits the model limits cleanly
            clean_phone = data.get('phoneNumber').replace(" ", "")
            user.phone_number = clean_phone[:20]

        db.session.commit()
        return jsonify({"status": "success", "message": "Profile updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 3. UPDATE PASSWORD
# ==========================================
@user_bp.route('/password', methods=['PUT'])
@jwt_required()
def update_password():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        data = request.get_json()

        new_password = data.get('new_password')
        if not new_password or len(new_password) < 8:
            return jsonify({"status": "error", "message": "Password must be at least 8 characters long."}), 400

        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Password updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# 9. PERMANENTLY DELETE USER
# ==========================================
@user_bp.route('/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_account(target_user_id):
    try:
        # 1. Security Check: Ensure the person making the request is an Admin
        current_user_id = int(get_jwt_identity())
        current_admin = User.query.get(current_user_id)
        
        if not current_admin or current_admin.user_role != 'Administrator':
            return jsonify({"status": "error", "message": "Unauthorized. Only Admins can delete accounts."}), 403

        # 2. Find the target user
        target_user = User.query.get(target_user_id)
        if not target_user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        # 3. Prevent the Admin from accidentally deleting their own master account
        if target_user.user_id == current_user_id:
            return jsonify({"status": "error", "message": "You cannot delete your own admin account."}), 400

        data = request.get_json()
        reason = data.get('reason', '')
        if len(reason.strip()) < 10:
             return jsonify({"status": "error", "message": "Please provide a detailed reason (at least 10 characters)."}), 400

        # 4. Safely delete associated tables to prevent Foreign Key constraint errors
        if target_user.user_role == 'Student':
            student_record = Student.query.filter_by(user_id=target_user.user_id).first()
            if student_record:
                db.session.delete(student_record)
                
        elif target_user.user_role in ('Supervisor', 'Coordinator'):
            sup_record = Supervisor.query.filter_by(user_id=target_user.user_id).first()
            if sup_record:
                if target_user.user_role == 'Coordinator':
                    coord_record = Coordinator.query.filter_by(supervisor_id=sup_record.supervisor_id).first()
                    if coord_record:
                        db.session.delete(coord_record)
                db.session.delete(sup_record)

        # 5. Finally, delete the main User record
        db.session.delete(target_user)
        db.session.commit()
        
        return jsonify({"status": "success", "message": f"Account for {target_user.email} permanently deleted."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ DELETE FAILED FOR USER {target_user_id}: {str(e)}\n")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500
    
# ==========================================
# 10. SYSTEM RESET (DANGER ZONE)
# ==========================================
@user_bp.route('/system-reset', methods=['POST'])
@jwt_required()
def system_reset():
    try:
        # 1. Security Check: Only the Master Admin can trigger a reset
        current_user_id = int(get_jwt_identity())
        current_admin = User.query.get(current_user_id)
        
        if not current_admin or current_admin.user_role != 'Administrator':
            return jsonify({"status": "error", "message": "Unauthorized. Only the Master Admin can perform a system reset."}), 403

        data = request.get_json()
        target = data.get('target') # Expected: 'students', 'faculty', or 'all'

        if target == 'students':
            # Delete all Student profiles, then delete the User accounts tied to them
            Student.query.delete()
            User.query.filter_by(user_role='Student').delete()
            message = "All student records have been permanently deleted."

        elif target == 'faculty':
            # Delete in strict order to avoid Foreign Key errors
            Coordinator.query.delete()
            Supervisor.query.delete()
            User.query.filter(User.user_role.in_(['Supervisor', 'Coordinator'])).delete()
            message = "All faculty (Supervisors and Coordinators) have been permanently deleted."

        elif target == 'all':
            # Wipe everyone EXCEPT the current Master Admin
            Student.query.delete()
            Coordinator.query.delete()
            Supervisor.query.delete()
            User.query.filter(User.user_id != current_user_id).delete()
            message = "FACTORY RESET: All users have been wiped. Only the Master Admin remains."
            
        else:
            return jsonify({"status": "error", "message": "Invalid reset target."}), 400

        db.session.commit()
        return jsonify({"status": "success", "message": message}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ SYSTEM RESET FAILED: {str(e)}\n")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500
    
# ==========================================
# 11. ADMIN: GET SYSTEM STATISTICS
# ==========================================
@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_system_stats():
    try:
        # Check if Admin
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user or user.user_role != 'Administrator':
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        # 1. User Role Counts
        students_count = User.query.filter_by(user_role='Student').count()
        supervisors_count = User.query.filter_by(user_role='Supervisor').count()
        coords_count = User.query.filter_by(user_role='Coordinator').count()

        # 2. Student Year Counts
        yr2_count = Student.query.filter_by(year='2').count()
        yr4_count = Student.query.filter_by(year='4').count()

        # 3. Account Status Counts
        active_count = User.query.filter_by(account_status='Accepted').count()
        pending_count = User.query.filter_by(account_status='Pending').count()
        suspended_count = User.query.filter_by(account_status='Suspended').count()

        return jsonify({
            "status": "success",
            "data": {
                "roles": [students_count, supervisors_count, coords_count],
                "years": [yr2_count, yr4_count],
                "status": [active_count, pending_count, suspended_count]
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500