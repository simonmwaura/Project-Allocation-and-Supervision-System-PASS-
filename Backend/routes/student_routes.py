from flask import send_from_directory, current_app, jsonify, Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime # Added this
import os


# Updated to include all models used in your routes
from models import (
    db, User, Student, Supervisor, Project_Pitch, 
    Supervisor_Interest, Research_Tag, Student_Submission, 
    Submission_Attachment, Milestone # Added Milestone and corrected Attachment name
)


# Make sure you have a folder to save files to, e.g., 'uploads/submissions'
UPLOAD_FOLDER = 'uploads/submissions'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

student_bp = Blueprint('students', __name__)

# ==========================================
# --- PROFILE MANAGEMENT ROUTES ---
# ==========================================

# 1. READ: Get My Own Profile
@student_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or not user.students:
        return jsonify({"status": "error", "message": "Student profile not found"}), 404

    return jsonify({
        "status": "success",
        "data": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,               # <-- ADDED THIS
            "phone_number": user.phone_number, # <-- ADDED THIS
            "registration_number": user.students.registration_number,
            "year": user.students.year
        }
    }), 200

# 2. UPDATE: Edit Phone Number
@student_bp.route('/me/phone', methods=['PATCH'])
@jwt_required()
def update_phone():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    new_phone = data.get('phone_number')
    if not new_phone or len(new_phone) < 10:
        return jsonify({"status": "error", "message": "Invalid phone number format"}), 400

    try:
        user.phone_number = new_phone
        db.session.commit()
        return jsonify({"status": "success", "message": "Phone number updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# 3. UPDATE: Change Password
@student_bp.route('/me/change-password', methods=['PATCH'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    new_password = data.get('new_password')
    if not new_password or len(new_password) < 8:
        return jsonify({"status": "error", "message": "Password must be at least 8 characters"}), 400

    try:
        # Hash the password before saving! Never store plain text.
        user.password = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"status": "success", "message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# --- DASHBOARD & PITCH ROUTES ---
# ==========================================
# 4. GET STUDENT STATUS
@student_bp.route('/my-status', methods=['GET']) # Added the @ here!
@jwt_required()
def get_my_status():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # Use the relationship name 'students' from your User model
        student = user.students 
        
        if not student:
            # Let's add a much deeper debug print
            print(f"\n[DEBUG] User {user_id} found. Students relationship: {user.students}")
            return jsonify({"status": "error", "message": "Student profile not found"}), 404

        # 1. Check if they are already ASSIGNED
        if student.assigned_supervisor_id:
            supervisor = Supervisor.query.get(student.assigned_supervisor_id)
            sup_user = User.query.get(supervisor.user_id)
            return jsonify({
                "status": "success",
                "data": {
                    "status": "assigned",
                    "supervisor": {"name": f"{sup_user.first_name} {sup_user.last_name}", "email": sup_user.email}
                }
            }), 200

       # 2. Check for PENDING and DECLINED pitches
        # We grab both so the React Dashboard knows which ones to mark red
        active_pitches = Project_Pitch.query.filter(
            Project_Pitch.student_id == student.student_id,
            Project_Pitch.status.in_(['Pending', 'Declined'])
        ).all()
        
        if active_pitches:
            pitches_data = []
            for p in active_pitches:
                sup = Supervisor.query.get(p.supervisor_id)
                sup_user = User.query.get(sup.user_id)
                pitches_data.append({
                    "pitch_id": p.pitch_id,
                    "supervisor_id": p.supervisor_id,
                    "supervisorName": f"{sup_user.first_name} {sup_user.last_name}",
                    "projectTitle": p.project_title,
                    "projectPitch": p.abstract,
                    "status": p.status,               # <-- NEW: Tells React if Pending or Declined
                    "declineReason": p.decline_reason # <-- NEW: The feedback text
                })
                
            return jsonify({
                "status": "success",
                "data": {
                    "status": "has_pitches", 
                    "pitches": pitches_data 
                }
            }), 200

        # 3. Otherwise, they are UNASSIGNED
        return jsonify({
            "status": "success",
            "data": {"status": "unassigned"}
        }), 200

    except Exception as e:
        print(f"\n\n=== STATUS ERROR: {str(e)} ===\n\n") 
        return jsonify({"status": "error", "message": str(e)}), 500


# 5. GET AVAILABLE SUPERVISORS
@student_bp.route('/available-supervisors', methods=['GET'])
@jwt_required()
def get_available_supervisors():
    try:
        supervisors = Supervisor.query.all()
        data = []

        for sup in supervisors:
            user = User.query.get(sup.user_id)
            if not user or user.account_status != 'Accepted':
                continue # Only show active supervisors
            
            # Fetch interests
            interests = []
            sup_interests = Supervisor_Interest.query.filter_by(supervisor_id=sup.supervisor_id).all()
            for si in sup_interests:
                tag = Research_Tag.query.get(si.tag_id)
                if tag:
                    interests.append(tag.tag_name)

            # Calculate slots filled
            slots_filled = Student.query.filter_by(assigned_supervisor_id=sup.supervisor_id).count()
            slots_total = sup.capacity if hasattr(sup, 'capacity') else 7

            data.append({
                "id": sup.supervisor_id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "interests": interests,
                "slotsTotal": slots_total,
                "slotsFilled": slots_filled
            })

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 6. WITHDRAW PITCH
@student_bp.route('/withdraw-pitch/<int:pitch_id>', methods=['DELETE'])
@jwt_required()
def withdraw_pitch(pitch_id): # Accept ID in the URL
    try:
        user_id = int(get_jwt_identity())
        student = Student.query.filter_by(user_id=user_id).first()
        
        # Find the specific pitch belonging to this student
        pitch = Project_Pitch.query.filter_by(
            pitch_id=pitch_id, 
            student_id=student.student_id, 
            status='Pending'
        ).first()
        
        if not pitch:
            return jsonify({"status": "error", "message": "Pitch not found or already processed."}), 404

        db.session.delete(pitch)
        db.session.commit()
        return jsonify({"status": "success", "message": "Pitch withdrawn successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# 7. SUBMIT A PROJECT PITCH
@student_bp.route('/pitch', methods=['POST'])
@jwt_required()
def submit_pitch():
    try:
        user_id = int(get_jwt_identity())
        student = Student.query.filter_by(user_id=user_id).first()
        
        if not student:
            return jsonify({"status": "error", "message": "Student profile not found"}), 404

        data = request.get_json()
        supervisor_id = data.get('supervisor_id')
        title = data.get('title')
        description = data.get('description')

        if not supervisor_id or not title or not description:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        # Check 1: Are they already at the limit of 3?
        pending_count = Project_Pitch.query.filter_by(student_id=student.student_id, status='Pending').count()
        if pending_count >= 3:
            return jsonify({"status": "error", "message": "You have reached the maximum limit of 3 pending pitches."}), 400

        # Check 2: Did they already pitch THIS specific supervisor?
        duplicate_pitch = Project_Pitch.query.filter_by(student_id=student.student_id, supervisor_id=supervisor_id, status='Pending').first()
        if duplicate_pitch:
            return jsonify({"status": "error", "message": "You have already pitched to this supervisor."}), 400

        # Save to database
        new_pitch = Project_Pitch(
            student_id=student.student_id,
            supervisor_id=supervisor_id,
            project_title=title,       
            abstract=description,      
            status='Pending'
        )
        db.session.add(new_pitch)
        db.session.commit()

        return jsonify({"status": "success", "message": "Pitch submitted successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== PITCH ERROR: {str(e)} ===\n\n") 
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# 8. GET PROJECT OVERVIEW
# ==========================================
@student_bp.route('/project-overview', methods=['GET'])
@jwt_required()
def get_project_overview():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        student = user.students

        if not student or not student.assigned_supervisor_id:
            return jsonify({"status": "error", "message": "No active project."}), 404

        sup = Supervisor.query.get(student.assigned_supervisor_id)
        sup_user = User.query.get(sup.user_id)

        # Look for the pitch that got them this supervisor
        pitch = Project_Pitch.query.filter_by(
            student_id=student.student_id, 
            supervisor_id=sup.supervisor_id,
            status='Accepted' 
        ).first()

        return jsonify({
            "status": "success",
            "data": {
                "title": pitch.project_title if pitch else "Active Research Project",
                "supervisor": f"{sup_user.first_name} {sup_user.last_name}",
                "status": "Active"
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500   
    
# ==========================================
# 9. UPLOAD DOCUMENT
# ==========================================
@student_bp.route('/upload-document', methods=['POST'])
@jwt_required()
def upload_document():
    try:
        user_id = int(get_jwt_identity())
        student = Student.query.filter_by(user_id=user_id).first()

        if not student:
            return jsonify({"status": "error", "message": "Student profile not found"}), 404

        milestone_id = request.form.get('milestone_id')
        file = request.files.get('file')

        if not milestone_id or not file:
            return jsonify({"status": "error", "message": "Missing milestone or file."}), 400

        milestone = Milestone.query.get(int(milestone_id))
        if not milestone:
            return jsonify({"status": "error", "message": "Invalid milestone."}), 404

        # Determine on-time or late
        now = datetime.utcnow()
        submission_status = "On Time" if now <= milestone.due_date else "Late"

        # Save file to disk
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].lower()
        unique_filename = f"{student.student_id}_{milestone_id}_{filename}"
        
        # --- ADD THESE TWO LINES TO FORCE THE EXACT FOLDER ---
        UPLOAD_FOLDER = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True) 
        
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)

        # Check if student already submitted for this milestone (resubmission)
        existing = Student_Submission.query.filter_by(
            student_id=student.student_id,
            milestone_id=int(milestone_id)
        ).first()

        if existing:
            # Update the existing submission
            existing.submission_at = now
            existing.submission_status = "Resubmitted"

           # Remove old attachments and add the new one
            Submission_Attachment.query.filter_by(submission_id=existing.submission_id).delete()
            new_attachment = Submission_Attachment(
                submission_id=existing.submission_id,
                file_url=unique_filename, # <--- FIXED
                file_type=file_ext
            )
            db.session.add(new_attachment)

        else:
            # First-time submission
            new_submission = Student_Submission(
                student_id=student.student_id,
                milestone_id=int(milestone_id),
                submission_status=submission_status
            )
            db.session.add(new_submission)
            db.session.flush()  # Get the new submission_id before commit

            new_attachment = Submission_Attachment(
                submission_id=new_submission.submission_id,
                file_url=unique_filename, # <--- FIXED
                file_type=file_ext
            )
            db.session.add(new_attachment)

        db.session.commit()
        return jsonify({"status": "success", "message": "Document uploaded successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== UPLOAD ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": "Failed to upload document."}), 500

# ==========================================
# 10. GET SUBMISSION HISTORY
# ==========================================
@student_bp.route('/submissions', methods=['GET'])
@jwt_required()
def get_submissions():
    try:
        user_id = int(get_jwt_identity())
        student = Student.query.filter_by(user_id=user_id).first()

        if not student:
            return jsonify({"status": "error", "message": "Student not found"}), 404

        submissions = Student_Submission.query.filter_by(
            student_id=student.student_id
        ).order_by(Student_Submission.submission_at.desc()).all()

        data = []
        for s in submissions:
            # Get all file attachments for this submission
            attachments = Submission_Attachment.query.filter_by(submission_id=s.submission_id).all()
            files = [os.path.basename(a.file_url) for a in attachments]

            data.append({
                "id": s.submission_id,
                "milestone": s.student_submission_milestone.milestone_name,
                "submittedAt": s.submission_at.strftime("%B %d, %Y at %I:%M %p"),
                "submissionStatus": s.submission_status,
                "files": files
            })

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500  


@student_bp.route('/milestones', methods=['GET'])
@jwt_required()
def get_milestones():
    try:
        user_id = int(get_jwt_identity())
        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            return jsonify({"status": "error", "message": "Student not found"}), 404

        # Filter milestones by this student's year ('2' or '4')
        milestones = Milestone.query.filter_by(year=str(student.year)).order_by(Milestone.due_date).all()

        data = [
            {
                "milestone_id": m.milestone_id,
                "milestone_name": m.milestone_name,
                "due_date": m.due_date.strftime("%B %d, %Y at %I:%M %p")
            }
            for m in milestones
        ]

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500     
    
# Add these two routes to student_routes.py
# Also add to the imports at the top:
# from werkzeug.security import generate_password_hash  (already there)


# ==========================================
# GET: Student Onboarding Status
# Called by StudentWrapper on every /student/* load
# ==========================================
@student_bp.route('/onboarding-status', methods=['GET'])
@jwt_required()
def student_onboarding_status():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.students:
            return jsonify({"status": "error", "message": "Student profile not found"}), 404

        return jsonify({
            "status": "success",
            "onboarding_complete": user.students.onboarding_complete
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# POST: Complete Student Onboarding
# Saves phone number and hashed password, marks onboarding done
# ==========================================
@student_bp.route('/complete-onboarding', methods=['POST'])
@jwt_required()
def complete_student_onboarding():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.students:
            return jsonify({"status": "error", "message": "Student profile not found"}), 404

        data = request.get_json()
        phone    = data.get('phone_number', '').strip()
        password = data.get('password', '')

        if not phone or len(phone) < 10:
            return jsonify({"status": "error", "message": "Please enter a valid phone number."}), 400
        if not password or len(password) < 8:
            return jsonify({"status": "error", "message": "Password must be at least 8 characters."}), 400

        user.phone_number = phone
        user.password     = generate_password_hash(password)

        user.students.onboarding_complete = True

        db.session.commit()

        return jsonify({"status": "success", "message": "Account setup complete!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== STUDENT ONBOARDING ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# GET: Download a specific student submission file
# ==========================================
@student_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_student_file(filename):
    try:
        # Construct the path to your uploads directory
        UPLOADS_FOLDER = os.path.join(current_app.root_path, 'uploads')
        
        print(f"\n--- DEBUG (Student): Searching for file in: {UPLOADS_FOLDER} ---")
        print(f"--- DEBUG (Student): Filename: {filename} ---\n")
        
        # Serve the file securely, forcing a download
        return send_from_directory(UPLOADS_FOLDER, filename, as_attachment=True)
        
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "File not found on the server."}), 404
    except Exception as e:
        print(f"\n=== STUDENT DOWNLOAD ERROR: {str(e)} ===\n")
        return jsonify({"status": "error", "message": "Failed to download file."}), 500