from flask import Blueprint, request, jsonify,send_from_directory, current_app
from werkzeug.exceptions import NotFound # Add this import at the top
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, User, Supervisor, Supervisor_Interest, Research_Tag,
    Student, Project_Pitch, Panel, Panel_Member,
    Student_Submission, Submission_Attachment, Milestone
)
import os


supervisor_bp = Blueprint('supervisors', __name__)

@supervisor_bp.route('/me/logistics', methods=['PATCH'])
@jwt_required()
def update_logistics():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.supervisors:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        data = request.get_json()
        
        # Check and update all four fields
        if 'bio' in data:
            user.supervisors.bio = data['bio'].strip()
        if 'office_location' in data:
            user.supervisors.office_location = data['office_location'].strip()
        if 'office_hours' in data:
            user.supervisors.office_hours = data['office_hours'].strip()
        if 'supervision_preference' in data:
            user.supervisors.supervision_preference = data['supervision_preference'].strip()

        db.session.commit()
        return jsonify({"status": "success", "message": "Profile updated"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 1. GET: Fetch Entire Supervisor Profile
# ==========================================
@supervisor_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.supervisors:
            return jsonify({"status": "error", "message": "Supervisor profile not found"}), 404

        supervisor = user.supervisors

        # --- THE FIX: Using Research_Tag.tag_name ---
        tags = db.session.query(Research_Tag.tag_name)\
            .join(Supervisor_Interest, Supervisor_Interest.tag_id == Research_Tag.tag_id)\
            .filter(Supervisor_Interest.supervisor_id == supervisor.supervisor_id)\
            .all()

        actual_interests = [tag[0] for tag in tags]

        return jsonify({
            "status": "success",
            "data": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                
                # --- Logistics & Bio ---
                "bio": supervisor.bio,
                "office_location": supervisor.office_location,
                "office_hours": supervisor.office_hours,
                "max_2nd_year_capacity": supervisor.max_2nd_year_capacity,
                "max_4th_year_capacity": supervisor.max_4th_year_capacity,
                
                # --- Dynamically loaded from Database ---
                "research_interests": actual_interests
            }
        }), 200

    except Exception as e:
        print(f"Error fetching profile: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to fetch profile data"}), 500

# ==========================================
# 3. PATCH: Change Password
# ==========================================
@supervisor_bp.route('/me/change-password', methods=['PATCH'])
@jwt_required()
def change_password():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        data = request.get_json()
        new_password = data.get('new_password', '')

        if not new_password or len(new_password) < 8:
            return jsonify({"status": "error", "message": "Password must be at least 8 characters"}), 400

        # Hash the new password securely
        user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"status": "success", "message": "Password updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to update password"}), 500


# ==========================================
# 4. PATCH: Update Supervision Preferences
# ==========================================
@supervisor_bp.route('/me/preferences', methods=['PATCH'])
@jwt_required()
def update_preferences():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.supervisors:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        data = request.get_json()
        new_preferences = data.get('preferences', '').strip()

        user.supervisors.supervision_preference = new_preferences
        db.session.commit()

        return jsonify({"status": "success", "message": "Preferences updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Failed to update preferences"}), 500


# ==========================================
# 5. PATCH: Update Research Interests 
# ==========================================
@supervisor_bp.route('/me/interests', methods=['PATCH'])
@jwt_required()
def update_interests():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        supervisor = user.supervisors
        
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        data = request.get_json()
        new_interests = data.get('interests', [])

        # 1. Clear out old links
        Supervisor_Interest.query.filter_by(supervisor_id=supervisor.supervisor_id).delete()

        # 2. Add new links
        for tag_text in new_interests:
            # Match the column name 'tag_name' from your Research_Tag model
            tag = Research_Tag.query.filter_by(tag_name=tag_text).first() 
            
            if not tag:
                tag = Research_Tag(tag_name=tag_text)
                db.session.add(tag)
                db.session.flush()

            new_link = Supervisor_Interest(supervisor_id=supervisor.supervisor_id, tag_id=tag.tag_id)
            db.session.add(new_link)

        db.session.commit()
        return jsonify({"status": "success", "message": "Research interests updated successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating interests: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to update interests"}), 500
# ==========================================
# GET: My Supervisees
# ==========================================
@supervisor_bp.route('/my-supervisees', methods=['GET'])
@jwt_required()
def get_my_supervisees():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor profile not found"}), 404

        # 1. Fetch all students assigned to this specific supervisor
        assigned_students = Student.query.filter_by(assigned_supervisor_id=supervisor.supervisor_id).all()
        
        year2_students = []
        year4_students = []

        for student in assigned_students:
            user = User.query.get(student.user_id)
            # 2. Get the accepted pitch to display their Project Title
            accepted_pitch = Project_Pitch.query.filter(
                Project_Pitch.student_id == student.student_id,
                Project_Pitch.supervisor_id == supervisor.supervisor_id,
                Project_Pitch.status == 'Accepted' # <-- FIXED LINE
            ).first()
            
            project_title = accepted_pitch.project_title if accepted_pitch else "Active Research Project"

            # 3. Gather all document submissions for this student
            submissions = Student_Submission.query.filter_by(student_id=student.student_id).all()
            sub_data = []
            
            for sub in submissions:
                attachments = Submission_Attachment.query.filter_by(submission_id=sub.submission_id).all()
                files = [os.path.basename(a.file_url) for a in attachments]
                
                milestone_name = sub.student_submission_milestone.milestone_name if hasattr(sub, 'student_submission_milestone') else f"Milestone {sub.milestone_id}"

                sub_data.append({
                    "submissionId": sub.submission_id,
                    "milestone": milestone_name,
                    "submissionStatus": sub.submission_status,
                    "submittedAt": sub.submission_at.strftime("%B %d, %Y"),
                    "files": files
                })

            # 4. Build the dictionary that your React code expects
            student_dict = {
                "studentId": student.student_id,
                "studentName": f"{user.first_name} {user.last_name}",
                "registrationNumber": student.registration_number,
                "email": user.email,
                "projectTitle": project_title,
                "submissions": sub_data
            }

            # 5. Sort them into Year 2 or Year 4 arrays (WITH THE STRING FIX)
            student_year_str = str(student.year)
            
            if student_year_str == '2':
                year2_students.append(student_dict)
            elif student_year_str == '4':
                year4_students.append(student_dict)
            else:
                print(f"WARNING: Unknown year '{student.year}' for student {student.student_id}")
                year2_students.append(student_dict)

        return jsonify({
            "status": "success",
            "data": {
                "year2": year2_students,
                "year4": year4_students
            }
        }), 200

    except Exception as e:
        print(f"\n\n=== SUPERVISEE ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": "Failed to load supervisees"}), 500


@supervisor_bp.route('/complete-onboarding', 
methods=['PATCH'])
@jwt_required()
def complete_onboarding():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor record not found."}), 404

        data = request.get_json()

        # 1. Update the direct fields on the Supervisor model
        supervisor.max_2nd_year_capacity = data.get('max_2nd_year_capacity', 5)
        supervisor.max_4th_year_capacity = data.get('max_4th_year_capacity', 5)
        supervisor.office_location = data.get('office_location', '')
        supervisor.office_hours = data.get('office_hours', '')
        supervisor.bio = data.get('bio', '')
        
        # Mark onboarding as finished!
        supervisor.onboarding_complete = True

        # 2. Handle the Research Interests (Tags)
        interests = data.get('interests', [])
        
        # Clear any existing interests just in case they hit a back button and resubmitted
        Supervisor_Interest.query.filter_by(supervisor_id=supervisor.supervisor_id).delete()
        
        for tag_name in interests:
            # Check if the tag already exists in the master list, if not, create it
            tag = Research_Tag.query.filter_by(tag_name=tag_name).first()
            if not tag:
                tag = Research_Tag(tag_name=tag_name)
                db.session.add(tag)
                db.session.flush() # Get the new tag_id immediately

            # Link the tag to the supervisor
            new_interest = Supervisor_Interest(
                supervisor_id=supervisor.supervisor_id,
                tag_id=tag.tag_id
            )
            db.session.add(new_interest)

        db.session.commit()
        
        return jsonify({"status": "success", "message": "Onboarding completed successfully."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== ONBOARDING ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": "Failed to complete onboarding."}), 500





# ==========================================
# 1. GET: Onboarding Status
# ==========================================
@supervisor_bp.route('/onboarding-status', methods=['GET'])
@jwt_required()
def onboarding_status():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor profile not found"}), 404
        return jsonify({"status": "success", "onboarding_complete": supervisor.onboarding_complete}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 2. POST: Complete Onboarding Setup
# ==========================================
@supervisor_bp.route('/setup', methods=['POST'])
@jwt_required()
def setup_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()

        if not user or not supervisor:
            return jsonify({"status": "error", "message": "Supervisor profile not found"}), 404

        data = request.get_json()
        phone           = data.get('phone', '').strip()
        office_location = data.get('office_location', '').strip()
        office_hours    = data.get('office_hours', '').strip()
        bio             = data.get('bio', '').strip()
        interests       = data.get('interests', [])

        if not phone or len(phone) < 10:
            return jsonify({"status": "error", "message": "Please provide a valid phone number."}), 400
        if not office_location:
            return jsonify({"status": "error", "message": "Office location is required."}), 400
        if not office_hours:
            return jsonify({"status": "error", "message": "Office hours are required."}), 400
        if not interests:
            return jsonify({"status": "error", "message": "Please select at least one research interest."}), 400

        user.phone_number          = phone
        supervisor.office_location = office_location
        supervisor.office_hours    = office_hours
        supervisor.bio             = bio[:500]

        Supervisor_Interest.query.filter_by(supervisor_id=supervisor.supervisor_id).delete()
        for interest_name in interests:
            tag = Research_Tag.query.filter(Research_Tag.tag_name.ilike(interest_name)).first()
            if not tag:
                tag = Research_Tag(tag_name=interest_name)
                db.session.add(tag)
                db.session.flush()
            db.session.add(Supervisor_Interest(supervisor_id=supervisor.supervisor_id, tag_id=tag.tag_id))

        supervisor.onboarding_complete = True
        db.session.commit()
        return jsonify({"status": "success", "message": "Profile set up successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== SUPERVISOR SETUP ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 3. GET: Capacity (year-specific filled/total slots)
# Used by both PendingPitches and NoPendingPitches
# ==========================================
@supervisor_bp.route('/capacity', methods=['GET'])
@jwt_required()
def get_capacity():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()

        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        filled_year2 = Student.query.filter_by(
            assigned_supervisor_id=supervisor.supervisor_id, year='2'
        ).count()
        filled_year4 = Student.query.filter_by(
            assigned_supervisor_id=supervisor.supervisor_id, year='4'
        ).count()

        return jsonify({
            "status": "success",
            "data": {
                "year2": {"filled": filled_year2, "total": supervisor.max_2nd_year_capacity},
                "year4": {"filled": filled_year4, "total": supervisor.max_4th_year_capacity},
            }
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 4. GET: Pending Pitches
# ==========================================
@supervisor_bp.route('/pending-pitches', methods=['GET'])
@jwt_required()
def get_pending_pitches():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        pitches = Project_Pitch.query.filter_by(
            supervisor_id=supervisor.supervisor_id, status='Pending'
        ).all()

        data = []
        for p in pitches:
            student = Student.query.get(p.student_id)
            student_user = User.query.get(student.user_id)
            data.append({
                "pitchId": p.pitch_id,
                "projectTitle": p.project_title,
                "projectPitch": p.abstract,
                "studentName": f"{student_user.first_name} {student_user.last_name}",
                "studentEmail": student_user.email,
                "registrationNumber": student.registration_number,
                "year": student.year,
            })

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 5. PATCH: Approve a Pitch
# ==========================================
@supervisor_bp.route('/pitch/<int:pitch_id>/approve', methods=['PATCH'])
@jwt_required()
def approve_pitch(pitch_id):
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        pitch = Project_Pitch.query.filter_by(
            pitch_id=pitch_id, supervisor_id=supervisor.supervisor_id, status='Pending'
        ).first()
        if not pitch:
            return jsonify({"status": "error", "message": "Pitch not found or already actioned."}), 404

        student = Student.query.get(pitch.student_id)

        # Check capacity before approving
        filled = Student.query.filter_by(
            assigned_supervisor_id=supervisor.supervisor_id, year=student.year
        ).count()
        max_cap = supervisor.max_2nd_year_capacity if student.year == '2' else supervisor.max_4th_year_capacity

        if filled >= max_cap:
            return jsonify({"status": "error", "message": "You have reached your capacity for this year group."}), 400

        pitch.status = 'Accepted'
        student.assigned_supervisor_id = supervisor.supervisor_id

        # Withdraw all other pending pitches from this student
        other_pitches = Project_Pitch.query.filter(
            Project_Pitch.student_id == student.student_id,
            Project_Pitch.pitch_id != pitch_id,
            Project_Pitch.status == 'Pending'
        ).all()
        for other in other_pitches:
            other.status = 'Withdrawn'

        db.session.commit()
        return jsonify({"status": "success", "message": "Student assigned successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== APPROVE ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 6. PATCH: Decline a Pitch
# ==========================================
@supervisor_bp.route('/pitch/<int:pitch_id>/decline', methods=['PATCH'])
@jwt_required()
def decline_pitch(pitch_id):
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404

        pitch = Project_Pitch.query.filter_by(
            pitch_id=pitch_id, supervisor_id=supervisor.supervisor_id, status='Pending'
        ).first()
        if not pitch:
            return jsonify({"status": "error", "message": "Pitch not found or already actioned."}), 404

        data = request.get_json()
        pitch.status         = 'Declined'
        pitch.decline_reason = data.get('decline_reason', '').strip()

        db.session.commit()
        return jsonify({"status": "success", "message": "Pitch declined."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"\n\n=== DECLINE ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500
    
 
@supervisor_bp.route('/my-panel', methods=['GET'])
@jwt_required()
def get_my_panel():
    try:
        user_id = int(get_jwt_identity())
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
 
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor not found"}), 404
 
        # Find the panel this supervisor belongs to (in the active cycle)
        membership = Panel_Member.query.filter_by(
            supervisor_id=supervisor.supervisor_id
        ).first()
 
        if not membership:
            return jsonify({"status": "error", "message": "You are not assigned to a panel yet."}), 404
 
        panel = Panel.query.get(membership.panel_id)
 
        # Get all members of this panel
        all_memberships = Panel_Member.query.filter_by(panel_id=panel.panel_id).all()
 
        members_data = []
        for m in all_memberships:
            sup = Supervisor.query.get(m.supervisor_id)
            sup_user = User.query.get(sup.user_id)
 
            # Get all students assigned to this supervisor in the same year as the panel
            students = Student.query.filter_by(
                assigned_supervisor_id=sup.supervisor_id,
                year=panel.year
            ).all()
 
            students_data = []
            for student in students:
                student_user = User.query.get(student.user_id)
 
                # Get their accepted pitch for the project title
                accepted_pitch = Project_Pitch.query.filter(
                    Project_Pitch.student_id == student.student_id,
                    # THIS IS THE BROKEN LINE:
                    Project_Pitch.status.in_(['Accepted', 'Approved', 'Assigned'])
                ).first()
 
                project_title = accepted_pitch.project_title if accepted_pitch else "Untitled Project"
 
                # Get all submissions for this student
                submissions = Student_Submission.query.filter_by(
                    student_id=student.student_id
                ).order_by(Student_Submission.submission_at.desc()).all()
 
                submissions_data = []
                for sub in submissions:
                    milestone = Milestone.query.get(sub.milestone_id)
                    attachments = Submission_Attachment.query.filter_by(
                        submission_id=sub.submission_id
                    ).all()
                    files = [os.path.basename(a.file_url) for a in attachments]
 
                    submissions_data.append({
                        "submissionId": sub.submission_id,
                        "milestone": milestone.milestone_name if milestone else "Unknown",
                        "submittedAt": sub.submission_at.strftime("%B %d, %Y at %I:%M %p"),
                        "submissionStatus": sub.submission_status,
                        "files": files
                    })
 
                students_data.append({
                    "studentId": student.student_id,
                    "studentName": f"{student_user.first_name} {student_user.last_name}",
                    "registrationNumber": student.registration_number,
                    "year": student.year,
                    "projectTitle": project_title,
                    "submissions": submissions_data
                })
 
            members_data.append({
                "supervisorId": sup.supervisor_id,
                "supervisorName": f"{sup_user.first_name} {sup_user.last_name}",
                "supervisorEmail": sup_user.email,
                "role": m.panel_role,
                "students": students_data
            })
 
        return jsonify({
            "status": "success",
            "data": {
                "panelId": panel.panel_id,
                "panelNumber": panel.panel_number,
                "year": panel.year,
                "myRole": membership.panel_role,
                "currentSupervisorId": supervisor.supervisor_id,
                "members": members_data
            }
        }), 200
 
    except Exception as e:
        print(f"\n\n=== MY PANEL ERROR: {str(e)} ===\n\n")
        return jsonify({"status": "error", "message": str(e)}), 500
 
# ==========================================
# GET: Download a student submission file
# ==========================================
@supervisor_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_file(filename):
    try:
        # Define where your files are stored. 
        UPLOADS_FOLDER = os.path.join(current_app.root_path, 'uploads')
        
        # This will print the EXACT folder path Flask is checking
        print(f"\n--- DEBUG: Searching for file in: {UPLOADS_FOLDER} ---")
        print(f"--- DEBUG: Filename: {filename} ---\n")
        
        return send_from_directory(UPLOADS_FOLDER, filename, as_attachment=True)
        
    except NotFound:
        # This catches the 404 specifically so it doesn't trigger the 500 error
        return jsonify({"status": "error", "message": "File not found on the server."}), 404
    except Exception as e:
        print(f"\n=== DOWNLOAD ERROR: {str(e)} ===\n")
        return jsonify({"status": "error", "message": "Failed to download file."}), 500