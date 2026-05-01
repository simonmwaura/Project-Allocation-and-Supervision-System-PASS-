from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import csv
import io
from models import db, User, Student, Supervisor, Upload_log,AccountDeletionLog

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/upload-csv', methods=['POST'])
@jwt_required()
def upload_admin_csv():
    current_user_id = int(get_jwt_identity())
    
    # 1. Validate file exists in request
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
        
    file = request.files['file']
    upload_type = request.form.get('upload_type') # "Supervisors_CSV", "2nd Year CSV", etc.
    year = request.form.get('year')               # "2" or "4"
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    records_added = 0
    error_report = []

    try:
        # 2. Read CSV as text stream
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)
        
        for row_idx, row in enumerate(reader, start=2):
            try:
                email = row.get('email').strip()
                
                # Check if User exists
                if User.query.filter_by(email=email).first():
                    error_report.append({"row": row_idx, "error": f"User {email} already exists"})
                    continue

                # 3. Create the Base User
                new_user = User(
                    first_name=row.get('first_name'),
                    last_name=row.get('last_name'),
                    email=email,
                    user_role='Supervisor' if upload_type == "Supervisors_CSV" else 'Student',
                    account_status='Accepted' # Admins usually pre-approve these
                )
                db.session.add(new_user)
                db.session.flush() # Get new_user.user_id

                # 4. Create the Role-Specific Record
                if upload_type == "Supervisors_CSV":
                    new_role_record = Supervisor(
                        user_id=new_user.user_id,
                        # Add supervisor specific columns from CSV here
                    )
                else:
                    new_role_record = Student(
                        user_id=new_user.user_id,
                        registration_number=row.get('reg_number'),
                        year=year  # <--- Match it to your model column name
                    )
                
                db.session.add(new_role_record)
                records_added += 1

            except Exception as e:
                db.session.rollback()
                error_report.append({"row": row_idx, "error": str(e)})

        # 5. Determine Status and Save Log
        status = "Success" if not error_report else ("Partial" if records_added > 0 else "Fail")
        
        new_log = Upload_log(
            user_id=current_user_id,
            filename=file.filename,
            upload_type=upload_type,
            year=year,
            status=status,
            records_added=records_added,
            error_report=error_report
        )
        db.session.add(new_log)
        db.session.commit()

        return jsonify({
            "status": status,
            "records_added": records_added,
            "errors": error_report
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_account(user_id):
    current_admin_id = int(get_jwt_identity())
    data = request.get_json()
    
    # 1. Check for the reason
    reason = data.get('reason')
    if not reason or len(reason.strip()) < 10:
        return jsonify({"status": "error", "message": "Please provide a detailed reason (at least 10 characters)."}), 400

    # 2. Find the user
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"status": "error", "message": "User not found."}), 404

    # 3. Security Check: Don't let an admin delete themselves
    if target_user.user_id == current_admin_id:
        return jsonify({"status": "error", "message": "Self-deletion is not permitted."}), 400

    try:
        # 4. Log the deletion reason first
        log = AccountDeletionLog(
            admin_id=current_admin_id,
            deleted_user_email=target_user.email,
            deletion_reason=reason
        )
        db.session.add(log)

        # 5. Clean up sub-records (Cascding manually)
        # Based on your model relationships (student_user, supervisor_user)
        if target_user.students:
            db.session.delete(target_user.students)
        if target_user.supervisors:
            db.session.delete(target_user.supervisors)
        # Add Coordinator check here if you have a coordinator table linked to user_id

        # 6. Delete the main User account
        db.session.delete(target_user)
        
        db.session.commit()
        return jsonify({"status": "success", "message": f"Account for {target_user.email} deleted successfully."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500    