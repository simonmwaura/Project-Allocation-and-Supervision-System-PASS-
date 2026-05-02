from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from werkzeug.security import check_password_hash  # <-- NEEDED FOR STAFF LOGIN

from models import db, User,Student

user_bp = Blueprint('users', __name__)

# You will get this from the Google Cloud Console later
GOOGLE_CLIENT_ID = "1007402569571-7s9h5cb32gfkf4atjpp5svgpt8tnalmr.apps.googleusercontent.com"

# ==========================================
# 1. GOOGLE LOGIN (Strictly for Students)
# ==========================================
@user_bp.route('/auth/google', methods=['POST'])
def google_login():
    token = request.json.get('token')
    
    if not token:
        return jsonify({"status": "error", "message": "No token provided"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        google_id = idinfo['sub']
        email = idinfo['email']

        # 1. THE VIP LIST
        allowed_domains = ['@students.uonbi.ac.ke', '@uonbi.ac.ke']
        admin_emails = ['smmx2005@gmail.com'] # Add any other admin Gmails here
        
        # Check if they are either in the allowed domains OR on the admin VIP list
        if not any(email.endswith(domain) for domain in allowed_domains) and email not in admin_emails:
            return jsonify({
                "status": "error", 
                "message": "Access restricted. Please use your official University of Nairobi email address."
            }), 403 

        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        user = User.query.filter_by(email=email).first()

        if not user:
            # 2. THE AUTO-PROMOTER (New Users)
            assigned_role = 'Administrator' if email in admin_emails else 'Student'
        
            user = User(
                google_id=google_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                user_role=assigned_role,        
                account_status='Accepted' if assigned_role == 'Administrator' else 'Pending',   
                password=None               
            )
            db.session.add(user)
            db.session.commit()
        else:
            # 3. EXISTING USER CHECK
            if not user.google_id:
                user.google_id = google_id
            
            # If they already logged in before as a Student, auto-promote them now
            if email in admin_emails and user.user_role != 'Administrator':
                user.user_role = 'Administrator'
                user.account_status = 'Accepted'
                
            db.session.commit()

        # Create JWT...
        access_token = create_access_token(identity=str(user.user_id))

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.user_role,
                "first_name": user.first_name
            }
        }), 200

    except ValueError:
        return jsonify({"status": "error", "message": "Invalid Google token"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 2. MANUAL LOGIN (Strictly for Staff/Admins)
# ==========================================
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    # Intercept students trying to use the staff form
    if user and user.user_role == 'Student':
        return jsonify({
            "status": "error", 
            "message": "Students must log in using the Google button above."
        }), 403

    # Prevent crash if an admin was created but hasn't set a password yet
    if user and not user.password:
        return jsonify({
            "status": "error", 
            "message": "Account not fully set up. Please use the 'Forgot Password' link to set your password."
        }), 403

    # Verify standard Staff/Admin login
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.user_id))
        
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": {
                "role": user.user_role,
                "email": user.email,
                "first_name": user.first_name
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
# 4. GET ALL FACULTY (For Admin Dashboard)
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
            "first_name": user.first_name, # Included separately
            "last_name": user.last_name,   # Included separately
            "name": f"{user.first_name} {user.last_name}", # Pre-formatted
            "email": user.email,
            "phone": user.phone_number,
            "role": user.user_role,
            "status": user.account_status,
            "suspension_reason": user.suspension_reason
        })
    
    return jsonify({"status": "success", "data": faculty_data}), 200
# ==========================================
# GET ALL STUDENTS
# ==========================================
@user_bp.route('/students', methods=['GET'])
@jwt_required()
def get_all_students():
    # Get all users who are students
    students = User.query.filter_by(user_role='Student').all()
    
    student_data = []
    for user in students:
        # Get their specific student details (Reg No, Year)
        student_profile = Student.query.filter_by(user_id=user.user_id).first()
        
        student_data.append({
            "id": user.user_id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "phone": user.phone_number,
            
            # --- MAKE SURE THESE TWO LINES ARE HERE ---
            "status": user.account_status,
            "suspension_reason": user.suspension_reason,
            
            "reg": student_profile.registration_number if student_profile else "Not Set",
            "year": student_profile.year if student_profile else "2"
        })
        
    return jsonify({"status": "success", "data": student_data}), 200

# ==========================================
# 6. UPDATE USER DETAILS (Universal Route)
# ==========================================
@user_bp.route('/update/<int:target_user_id>', methods=['PUT'])
@jwt_required()
def update_user_details(target_user_id):
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        data = request.get_json()

        # 1. Update the base User table
        if 'email' in data:
            user.email = data['email']
            
        # WARNING: If your User model does NOT have a 'phone_number' column, 
        # this exact line will crash the server!
        if 'phone' in data:
            user.phone_number = data['phone']
            
        if 'name' in data:
            name_parts = data['name'].split()
            user.first_name = name_parts[0] if len(name_parts) > 0 else user.first_name
            user.last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else user.last_name

        # 2. If it's a student, ALSO update the relational Student table
        if user.user_role == 'Student':
            # Make sure 'Student' is imported at the top of this file!
            student_record = Student.query.filter_by(user_id=user.user_id).first()
            
            if not student_record:
                # Creates a new linked student profile
                student_record = Student(user_id=user.user_id, registration_number="Not Set", year='2')
                db.session.add(student_record)
                db.session.flush() # Secure the ID before continuing

            # Apply the updates
            if 'reg' in data:
                student_record.registration_number = data['reg']
            if 'year' in data:
                student_record.year = str(data['year']) 

        # Save everything
        db.session.commit()
        return jsonify({"status": "success", "message": "Account details updated successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        # This will print the EXACT reason it failed in your backend terminal!
        print(f"\n❌ UPDATE FAILED FOR USER {target_user_id}: {str(e)}\n")
        
        # This sends the exact error back to React so Toastify can show it to you
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500

# ==========================================
# 7. SUSPEND USER ACCOUNT
# ==========================================
@user_bp.route('/suspend/<int:target_user_id>', methods=['PATCH'])
@jwt_required()
def suspend_user(target_user_id):
    user = User.query.get(target_user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    data = request.get_json()
    reason = data.get('reason')

    if not reason:
        return jsonify({"status": "error", "message": "Suspension reason is required"}), 400

    # Update status in database
    user.account_status = 'Suspended'
    user.suspension_reason = reason # <-- ADD THIS LINE
    
    # Optional: If you have a 'notes' or 'suspension_reason' column in your User model:
    # user.suspension_reason = reason 

    try:
        db.session.commit()
        return jsonify({
            "status": "success", 
            "message": f"Account for {user.first_name} has been suspended successfully."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to update account status."}), 500
    
# ==========================================
# 8. UNSUSPEND USER ACCOUNT
# ==========================================
@user_bp.route('/unsuspend/<int:target_user_id>', methods=['PATCH'])
@jwt_required()
def unsuspend_user(target_user_id):
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # --- THE FIX ---
        # Change 'Active' to 'Accepted' to match your PostgreSQL Enum
        user.account_status = 'Accepted' 
        user.suspension_reason = None 

        db.session.commit()
        return jsonify({
            "status": "success", 
            "message": f"Account for {user.first_name} has been restored."
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"\n❌ UNSUSPEND FAILED FOR USER {target_user_id}: {str(e)}\n")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500