from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User, Student

student_bp = Blueprint('students', __name__)

# 1. READ: Get My Own Profile
# This joins the User and Student data so they see everything in one go.
@student_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = int(get_jwt_identity())
    
    # We query the User but join the Student table to get reg_number and year
    user = User.query.get(user_id)
    if not user or not user.students:
        return jsonify({"status": "error", "message": "Student profile not found"}), 404

    return jsonify({
        "status": "success",
        "data": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "registration_number": user.students.registration_number,
            "year": user.students.year,
            "role": user.user_role
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