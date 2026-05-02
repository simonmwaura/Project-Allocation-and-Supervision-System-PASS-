from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import csv
import io
from models import db, User, Student, Supervisor, Upload_log,AccountDeletionLog

admin_bp = Blueprint('admin', __name__)

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