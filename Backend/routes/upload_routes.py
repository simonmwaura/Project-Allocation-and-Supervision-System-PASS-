from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Upload_log, Student, Supervisor, AcademicCycle
import csv
import io

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload-csv', methods=['POST'])
@jwt_required()
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400

        file = request.files['file']
        upload_type = request.form.get('upload_type')

        if upload_type == "2nd Year CSV":
            target_role = "Student"
            target_year = "2"
            is_student_upload = True
        elif upload_type == "4th Year CSV":
            target_role = "Student"
            target_year = "4"
            is_student_upload = True
        elif upload_type == "Supervisors_CSV":
            target_role = "Supervisor"
            target_year = None
            is_student_upload = False
        else:
            return jsonify({"status": "error", "message": "Invalid upload type"}), 400

        active_cycle = AcademicCycle.query.filter_by(is_active=True).first()
        if is_student_upload and not active_cycle:
            return jsonify({"status": "error", "message": "No active academic cycle found"}), 400

        current_admin_id = get_jwt_identity()
        records_added = 0
        errors = []

        raw_content = file.stream.read().decode("UTF8")
        stream = io.StringIO(raw_content, newline=None)
        header_line = stream.readline()
        normalized_headers = [h.strip().lower() for h in header_line.split(',')]
        csv_reader = csv.DictReader(stream, fieldnames=normalized_headers)

        # ✅ no_autoflush prevents SQLAlchemy from flushing mid-loop
        # when queries like User.query.filter_by(...) are called
        with db.session.no_autoflush:
            for row_number, row in enumerate(csv_reader, start=2):
                new_user = None
                try:
                    email = (row.get('email') or '').strip()
                    first_name = (row.get('first_name') or '').strip()
                    last_name = (row.get('last_name') or '').strip()

                    if not email or not first_name:
                        errors.append({"row": row_number, "error": "Missing email or first_name."})
                        continue

                    if User.query.filter_by(email=email).first():
                        errors.append({"row": row_number, "email": email, "error": "User already exists."})
                        continue

                    new_user = User(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        user_role=target_role,
                        account_status='Pending'
                    )
                    db.session.add(new_user)
                    db.session.flush()

                    if is_student_upload:
                        reg_number = (row.get('reg_number') or row.get('registration_number') or '').strip()

                        if not reg_number:
                            errors.append({"row": row_number, "error": "Missing registration number."})
                            db.session.expunge(new_user)
                            continue

                        new_student = Student(
                            user_id=new_user.user_id,
                            registration_number=reg_number,
                            year=target_year,
                            cycle_id=active_cycle.cycle_id
                        )
                        db.session.add(new_student)

                    else:
                        new_supervisor = Supervisor(
                            user_id=new_user.user_id,
                            max_2nd_year_capacity=0,
                            max_4th_year_capacity=0
                        )
                        db.session.add(new_supervisor)

                    records_added += 1

                except Exception as e:
                    if new_user:
                        try:
                            db.session.expunge(new_user)
                        except Exception:
                            pass
                    errors.append({"row": row_number, "error": str(e)})
                    continue

        final_status = "Success" if not errors else ("Partial" if records_added > 0 else "Fail")

        new_log = Upload_log(
            user_id=current_admin_id,
            filename=file.filename,
            upload_type=upload_type,
            year=target_year,
            status=final_status,
            records_added=records_added,
            error_report=errors
        )
        db.session.add(new_log)
        db.session.commit()

        return jsonify({
            "status": "success",
            "data": {
                "status": final_status,
                "records_added": records_added,
                "errors": errors
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@upload_bp.route('/upload-logs', methods=['GET'])
@jwt_required()
def get_upload_logs():
    try:
        logs = Upload_log.query.order_by(Upload_log.uploaded_at.desc()).all()
        return jsonify({
            "status": "success",
            "data": [{
                "log_id": log.log_id,
                "filename": log.filename,
                "upload_type": log.upload_type,
                "status": log.status,
                "records_added": log.records_added,
                "error_report": log.error_report,
                "uploaded_at": log.uploaded_at.isoformat()
            } for log in logs]
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500