from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, User, Supervisor, Coordinator, CoordinatorHistory
from datetime import datetime

# --- DEFINE THE BLUEPRINT ---
coordinator_bp = Blueprint('coordinator', __name__)

# ==========================================
# 1. GET CURRENT COORDINATORS
# ==========================================
# URL will be: GET /api/coordinators/
@coordinator_bp.route('/', methods=['GET'])
@jwt_required()
def get_coordinators():
    try:
        coordinators = Coordinator.query.all()
        data = { "2": None, "4": None }
        
        for coord in coordinators:
            # Get the supervisor, then get their underlying user account to grab the name/email
            supervisor = Supervisor.query.get(coord.supervisor_id)
            if supervisor:
                user = User.query.get(supervisor.user_id)
                data[coord.year] = {
                    "id": user.user_id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email
                }
                
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 2. GET REASSIGNMENT HISTORY
# ==========================================
# URL will be: GET /api/coordinators/history
@coordinator_bp.route('/history', methods=['GET'])
@jwt_required()
def get_coordinator_history():
    try:
        # Fetch logs, newest first
        history_logs = CoordinatorHistory.query.order_by(CoordinatorHistory.created_at.desc()).all()
        
        data = [{
            "id": log.history_id,
            "date": log.created_at.strftime("%-m/%-d/%Y"), 
            "year": int(log.year),
            "prev": log.previous_coordinator_name,
            "curr": log.current_coordinator_name,
            "reason": log.reassignment_reason
        } for log in history_logs]
        
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 3. REASSIGN A COORDINATOR
# ==========================================
# URL will be: POST /api/coordinators/reassign
@coordinator_bp.route('/reassign', methods=['POST'])
@jwt_required()
def reassign_coordinator():
    try:
        data = request.get_json()
        target_year = str(data.get('year'))
        new_user_id = data.get('new_coordinator_id')
        reason = data.get('reason')

        if not target_year or not new_user_id or not reason:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        # 1. Get the new user and their supervisor profile
        new_user = User.query.get(new_user_id)
        new_supervisor = Supervisor.query.filter_by(user_id=new_user_id).first()
        
        if not new_supervisor:
            return jsonify({"status": "error", "message": "Selected user is not a supervisor."}), 400

        # 2. Find the existing coordinator for this year
        existing_coord = Coordinator.query.filter_by(year=target_year).first()
        prev_name = "None"

        if existing_coord:
            # Downgrade old coordinator back to standard Supervisor role
            old_supervisor = Supervisor.query.get(existing_coord.supervisor_id)
            if old_supervisor:
                old_user = User.query.get(old_supervisor.user_id)
                old_user.user_role = 'Supervisor'
                prev_name = f"{old_user.first_name} {old_user.last_name}"
            
            # Update the existing coordinator record with the new supervisor ID
            existing_coord.supervisor_id = new_supervisor.supervisor_id
        else:
            # Edge case: If no coordinator existed for this year yet, create one
            new_coord = Coordinator(supervisor_id=new_supervisor.supervisor_id, year=target_year)
            db.session.add(new_coord)

        # 3. Upgrade the new user's role to Coordinator
        new_user.user_role = 'Coordinator'
        curr_name = f"{new_user.first_name} {new_user.last_name}"

        # 4. Write to the History Log
        new_log = CoordinatorHistory(
            year=target_year,
            previous_coordinator_name=prev_name,
            current_coordinator_name=curr_name,
            reassignment_reason=reason
        )
        db.session.add(new_log)

        # 5. Save everything!
        db.session.commit()

        return jsonify({"status": "success", "message": f"Successfully reassigned to {curr_name}"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"REASSIGNMENT ERROR: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to reassign coordinator."}), 500