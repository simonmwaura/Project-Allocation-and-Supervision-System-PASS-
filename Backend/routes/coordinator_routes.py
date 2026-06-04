from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Supervisor, Coordinator, CoordinatorHistory, Panel, AcademicCycle, Panel_Member, Student, Project_Pitch, Broadcast
from sqlalchemy import cast, Integer

coordinator_bp = Blueprint('coordinator', __name__)

# ==========================================
# 1. ADMIN: GET CURRENT COORDINATORS
# ==========================================
# The strict_slashes=False fix goes here!
@coordinator_bp.route('', methods=['GET'], strict_slashes=False)
@coordinator_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_coordinators():
    try:
        coordinators = Coordinator.query.all()
        data = { "2": None, "4": None }
        for coord in coordinators:
            supervisor = Supervisor.query.get(coord.supervisor_id)
            if supervisor:
                user = User.query.get(supervisor.user_id)
                data[str(coord.year)] = {
                    "id": user.user_id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email
                }
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 1.5 ADMIN: GET COORDINATOR HISTORY
# ==========================================
@coordinator_bp.route('/history', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_coordinator_history():
    try:
        # Fetch history records (newest first)
        history_records = CoordinatorHistory.query.order_by(CoordinatorHistory.history_id.desc()).all()
        
        data = []
        for record in history_records:
            # Safely format the date if your model has a created_at field
            record_date = "N/A"
            if hasattr(record, 'created_at') and record.created_at:
                record_date = record.created_at.strftime("%b %d, %Y")

            data.append({
                "id": record.history_id,
                "date": record_date,                                      # Added Date
                "year": record.year,
                "previous_coordinator": record.previous_coordinator_name, 
                "current_coordinator": record.current_coordinator_name,   # Renamed to 'current' instead of 'new'
                "reason": record.reassignment_reason,
            })
            
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
# ==========================================
# 2. ADMIN: REASSIGN A COORDINATOR
# ==========================================
@coordinator_bp.route('/reassign', methods=['POST'], strict_slashes=False)
@jwt_required()
def reassign_coordinator():
    try:
        data = request.get_json()
        target_year = str(data.get('year'))
        new_user_id = data.get('new_coordinator_id')
        reason = data.get('reason')

        new_user = User.query.get(new_user_id)
        new_sup = Supervisor.query.filter_by(user_id=new_user_id).first()
        
        if not new_sup:
            return jsonify({"status": "error", "message": "Selected user is not a supervisor."}), 400

        existing_coord = Coordinator.query.filter_by(year=target_year).first()
        prev_name = "None"

        if existing_coord:
            old_sup = Supervisor.query.get(existing_coord.supervisor_id)
            if old_sup:
                old_user = User.query.get(old_sup.user_id)
                old_user.user_role = 'Supervisor'
                prev_name = f"{old_user.first_name} {old_user.last_name}"
            existing_coord.supervisor_id = new_sup.supervisor_id
        else:
            db.session.add(Coordinator(supervisor_id=new_sup.supervisor_id, year=target_year))

        new_user.user_role = 'Coordinator'
        db.session.add(CoordinatorHistory(
            year=target_year,
            previous_coordinator_name=prev_name,
            current_coordinator_name=f"{new_user.first_name} {new_user.last_name}",
            reassignment_reason=reason
        ))
        db.session.commit()
        return jsonify({"status": "success", "message": "Reassigned successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 3. PANELS: GET ALL PANELS
# ==========================================
@coordinator_bp.route('/panels', methods=['GET'])
@jwt_required()
def get_panels():
    try:
        user_id = get_jwt_identity()
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor.supervisor_id).first()
        
        if not coordinator:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 403

        panels = Panel.query.filter_by(year=coordinator.year).order_by(cast(Panel.panel_number, Integer).asc()).all()
        
        data = []
        for p in panels:
            chair_name = "Unassigned"
            if hasattr(p, 'chair') and p.chair:
                chair_name = f"{p.chair.first_name} {p.chair.last_name}"

            data.append({
                "panelId": p.panel_id,
                "panelNumber": p.panel_number,
                "chairName": chair_name,
                "memberCount": len(p.members) if p.members else 0,
                "maxCapacity": p.max_capacity or 3,
                "studentCount": 0 
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 4. PANELS: GENERATE (With Math-Safe logic & 6-Panel Cap)
# ==========================================
@coordinator_bp.route('/generate-panels', methods=['POST'])
@jwt_required()
def generate_panels():
    try:
        data = request.get_json()
        requested_count = int(data.get('count', 0))
        
        user_id = get_jwt_identity()
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor.supervisor_id).first()
        
        if not coordinator:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 403

        # 1. Enforce the Cap of 6
        current_count = Panel.query.filter_by(year=coordinator.year).count()
        if current_count >= 6:
            return jsonify({"status": "error", "message": "Maximum limit of 6 panels reached."}), 400
        
        if current_count + requested_count > 6:
            return jsonify({"status": "error", "message": f"You can only add {6 - current_count} more panels."}), 400

        # 2. Get active cycle
        active_cycle = AcademicCycle.query.filter_by(is_active=True).first()
        if not active_cycle:
            return jsonify({"status": "error", "message": "No active academic cycle found."}), 400

        # 3. Calculate starting panel number (Math-Safe)
        last_panel = Panel.query.filter_by(year=coordinator.year).order_by(cast(Panel.panel_number, Integer).desc()).first()
        start_num = (int(last_panel.panel_number) + 1) if last_panel else 1

        for i in range(requested_count):
            new_p = Panel(
                panel_number=str(start_num + i),
                cycle_id=active_cycle.cycle_id,
                max_capacity=3,
                year=coordinator.year
            )
            db.session.add(new_p)

        db.session.commit()
        return jsonify({"status": "success", "message": f"Generated {requested_count} panels."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 5. PANELS: DELETE ALL
# ==========================================
@coordinator_bp.route('/panels/delete-all', methods=['DELETE'])
@jwt_required()
def delete_all_panels():
    try:
        user_id = get_jwt_identity()
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor.supervisor_id).first()
        
        if not coordinator:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        Panel.query.filter_by(year=coordinator.year).delete()
        db.session.commit()
        return jsonify({"status": "success", "message": "All panels cleared."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# 6. ASSIGN CHAIR TO PANEL
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/assign-chair', methods=['PUT'])
@jwt_required()
def assign_panel_chair(panel_id):
    try:
        data = request.get_json()
        supervisor_id = data.get('supervisor_id') # ID of the supervisor to be chair

        panel = Panel.query.get_or_404(panel_id)
        
        # Verify the supervisor exists
        supervisor = Supervisor.query.get_or_404(supervisor_id)

        # Logic: Assign the chair
        panel.chair_id = supervisor.supervisor_id
        db.session.commit()

        return jsonify({"status": "success", "message": f"Chair assigned successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 7. DELETE INDIVIDUAL PANEL
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>', methods=['DELETE'])
@jwt_required()
def delete_panel(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        db.session.delete(panel)
        db.session.commit()
        return jsonify({"status": "success", "message": "Panel deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# 8. PANELS: GET SINGLE PANEL DETAILS
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>', methods=['GET'])
@jwt_required()
def get_single_panel(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        
        chair_name = "Unassigned"
        chair_id = None
        if hasattr(panel, 'chair') and panel.chair:
            chair_name = f"{panel.chair.first_name} {panel.chair.last_name}"
            chair_id = panel.chair_id

        # Format assigned members (Supervisors)
        members_data = []
        if hasattr(panel, 'members'):
            for member in panel.members:
                # Assuming 'member' is a Supervisor object linked to a User
                user = User.query.get(member.user_id)
                if user:
                    members_data.append({
                        "id": member.supervisor_id,
                        "name": f"{user.first_name} {user.last_name}"
                    })

        data = {
            "panelId": panel.panel_id,
            "panelNumber": panel.panel_number,
            "chairName": chair_name,
            "chairId": chair_id,
            "maxCapacity": panel.max_capacity or 4,
            "studentCount": 0,
            "members": members_data
        }
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 9. PANELS: UPDATE SETTINGS (Capacity & Chair)
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/settings', methods=['PUT'])
@jwt_required()
def update_panel_settings(panel_id):
    try:
        data = request.get_json()
        panel = Panel.query.get_or_404(panel_id)
        
        new_capacity = data.get('max_capacity')
        new_chair_id = data.get('chair_id')

        # Update Capacity
        if new_capacity in [3, 4]:
            panel.max_capacity = new_capacity

        # Update Chair
        if new_chair_id:
            supervisor = Supervisor.query.get(new_chair_id)
            if supervisor:
                panel.chair_id = supervisor.supervisor_id

        db.session.commit()
        return jsonify({"status": "success", "message": "Settings updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    

# ==========================================
# 10. GET ELIGIBLE SUPERVISORS
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/eligible-supervisors', methods=['GET'])
@jwt_required()
def get_eligible_supervisors(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        
        # 1. Find IDs of supervisors already in ANY panel for this cycle
        occupied_supervisor_ids = db.session.query(Panel_Member.supervisor_id).join(Panel).filter(
            Panel.cycle_id == panel.cycle_id
        ).all()
        occupied_ids = [r[0] for r in occupied_supervisor_ids]

        # 2. Query Supervisors who are 'Accepted' and NOT in the occupied list
        eligible = Supervisor.query.join(User).filter(
            User.account_status == 'Accepted',
            Supervisor.supervisor_id.not_in(occupied_ids)
        ).all()

        data = [{
            "id": s.supervisor_id,
            "name": f"{s.user.first_name} {s.user.last_name}",
            "email": s.user.email
        } for s in eligible]

        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 11. ADD SUPERVISOR TO PANEL
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/add-member', methods=['POST'])
@jwt_required()
def add_panel_member(panel_id):
    try:
        data = request.get_json()
        sup_id = data.get('supervisor_id')
        
        panel = Panel.query.get_or_404(panel_id)
        
        # Check if panel is full (based on your 4-member rule)
        current_members = Panel_Member.query.filter_by(panel_id=panel_id).count()
        if current_members >= (panel.max_capacity or 4):
            return jsonify({"status": "error", "message": "Panel has reached maximum capacity."}), 400

        # Create the assignment
        new_member = Panel_Member(panel_id=panel_id, supervisor_id=sup_id)
        db.session.add(new_member)
        db.session.commit()

        return jsonify({"status": "success", "message": "Supervisor added to panel."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ==========================================
# NEW: GET CURRENT COORDINATOR PROFILE
# ==========================================
@coordinator_bp.route('/me', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_my_coordinator_profile():
    try:
        user_id = get_jwt_identity()
        # Find the user first
        user = User.query.get(user_id)
        # Find the supervisor profile associated with this user
        supervisor = Supervisor.query.filter_by(user_id=user_id).first()
        
        if not supervisor:
            return jsonify({"status": "error", "message": "Supervisor profile not found"}), 404
            
        # Find the coordinator profile for this supervisor
        coord = Coordinator.query.filter_by(supervisor_id=supervisor.supervisor_id).first()
        
        if not coord:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 404

        return jsonify({
            "status": "success",
            "data": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "year": coord.year
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

    
# ==========================================
# 13. GET STUDENTS OVERVIEW (ALLOCATION STATUS)
# ==========================================
@coordinator_bp.route('/students-overview', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_students_overview():
    try:
        user_id = get_jwt_identity()
        supervisor_profile = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor_profile.supervisor_id).first()
        
        if not coordinator:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        # Fetch students matching the coordinator's year
        students = Student.query.filter_by(year=coordinator.year).all()
        
        data = []
        for student in students:
            status = "Unassigned"
            supervisor_name = None

            # Check their pitches to determine status
            accepted_pitch = Project_Pitch.query.filter_by(student_id=student.student_id, status='Accepted').first()
            pending_pitches = Project_Pitch.query.filter_by(student_id=student.student_id, status='Pending').count()

            if accepted_pitch:
                status = "Assigned"
                sup_user = accepted_pitch.supervisor_in_charge.supervisor_user
                supervisor_name = f"Dr. {sup_user.first_name} {sup_user.last_name}"
            elif pending_pitches > 0:
                status = "Pitching"

            data.append({
                "id": student.student_id,
                "firstName": student.student_user.first_name,
                "lastName": student.student_user.last_name,
                "regNumber": student.registration_number,
                "email": student.student_user.email,
                "status": status,
                "supervisor": supervisor_name
            })

        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# 14. BROADCASTS (GET & POST) - UPDATED
# ==========================================
@coordinator_bp.route('/broadcasts', methods=['GET', 'POST'], strict_slashes=False)
@jwt_required()
def handle_broadcasts():
    user_id = get_jwt_identity()
    supervisor_profile = Supervisor.query.filter_by(user_id=user_id).first()
    coordinator = Coordinator.query.filter_by(supervisor_id=supervisor_profile.supervisor_id).first()
    
    if not coordinator:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    if request.method == 'POST':
        try:
            data = request.get_json()
            title = data.get('title')
            message = data.get('message')

            if not title or not message:
                return jsonify({"status": "error", "message": "Title and message are required."}), 400

            # CORRECTED: Added broadcast_year as required by your db.Model
            new_broadcast = Broadcast(
                coordinator_id=coordinator.coordinator_id,
                title=title,
                message=message,
                broadcast_year=coordinator.year 
            )
            db.session.add(new_broadcast)
            db.session.commit()

            return jsonify({"status": "success", "message": "Broadcast sent successfully."}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'GET':
        try:
            # Fetch broadcasts authored by this coordinator, newest first 
            # (using broadcast_id to sort since created_at is missing from your model)
            broadcasts = Broadcast.query.filter_by(coordinator_id=coordinator.coordinator_id)\
                                        .order_by(Broadcast.broadcast_id.desc()).all()
            data = []
            for b in broadcasts:
                author_user = b.author.coordinator_supervisor.supervisor_user
                
                # Check if created_at exists (in case you update your model later)
                date_str = "Recently"
                if hasattr(b, 'created_at') and b.created_at:
                     date_str = b.created_at.strftime("%b %d")

                data.append({
                    "id": b.broadcast_id,
                    "title": b.title,
                    "message": b.message,
                    "date": date_str,
                    "author": f"Dr. {author_user.first_name} - Project Coordinator",
                    "year": b.broadcast_year
                })

            return jsonify({"status": "success", "data": data}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        
# ── Add these routes to coordinator_routes.py ────────────────────────────────
# Also add to your imports at the top:
# from models import ..., Student_Submission, Milestone


# ==========================================
# PATCH: Override supervisor capacity
# Coordinator can raise/lower a supervisor's cap for their year group
# ==========================================
@coordinator_bp.route('/supervisors/<int:supervisor_id>/override-capacity', methods=['PATCH'])
@jwt_required()
def override_supervisor_capacity(supervisor_id):
    try:
        user_id = get_jwt_identity()
        supervisor_profile = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor_profile.supervisor_id).first()

        if not coordinator:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data          = request.get_json()
        new_capacity  = int(data.get('capacity', 0))
        year          = str(data.get('year', coordinator.year))

        if new_capacity < 1 or new_capacity > 15:
            return jsonify({"status": "error", "message": "Capacity must be between 1 and 15."}), 400

        target_sup = Supervisor.query.get(supervisor_id)
        if not target_sup:
            return jsonify({"status": "error", "message": "Supervisor not found."}), 404

        if year == '2':
            target_sup.max_2nd_year_capacity = new_capacity
        else:
            target_sup.max_4th_year_capacity = new_capacity

        db.session.commit()
        return jsonify({"status": "success", "message": f"Capacity updated to {new_capacity}."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# POST: Nudge a supervisor (log the action — email can be wired later)
# ==========================================
@coordinator_bp.route('/supervisors/<int:supervisor_id>/nudge', methods=['POST'])
@jwt_required()
def nudge_supervisor(supervisor_id):
    try:
        # For now this just returns success.
        # In production: send an automated email via SendGrid or similar.
        target_sup  = Supervisor.query.get(supervisor_id)
        if not target_sup:
            return jsonify({"status": "error", "message": "Supervisor not found."}), 404

        sup_user = User.query.get(target_sup.user_id)
        # Log or send email here in production
        print(f"[NUDGE] Reminder triggered for {sup_user.email}")

        return jsonify({"status": "success", "message": f"Reminder logged for {sup_user.email}."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# GET: Coordinators overview (updated to return declined count too)
# Replace your existing supervisors-overview with this version
# ==========================================
@coordinator_bp.route('/supervisors-overview', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_supervisors_overview():
    try:
        user_id = get_jwt_identity()
        supervisor_profile = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor_profile.supervisor_id).first()

        if not coordinator:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        supervisors = Supervisor.query.join(User).filter(User.account_status == 'Accepted').all()

        data = []
        for sup in supervisors:
            max_cap = (
                sup.max_2nd_year_capacity
                if coordinator.year == '2'
                else sup.max_4th_year_capacity
            )

            accepted_count = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Accepted',
                Student.year == coordinator.year
            ).count()

            pending_count = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Pending',
                Student.year == coordinator.year
            ).count()

            # NEW: declined count
            declined_count = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Declined',
                Student.year == coordinator.year
            ).count()

            data.append({
                "id": sup.supervisor_id,
                "firstName": sup.supervisor_user.first_name,
                "lastName": sup.supervisor_user.last_name,
                "email": sup.supervisor_user.email,
                "maxCapacity": max_cap,
                "max2ndYear": sup.max_2nd_year_capacity,
                "max4thYear": sup.max_4th_year_capacity,
                "accepted": accepted_count,
                "pendingPitches": pending_count,
                "declined": declined_count,         # NEW
            })

        return jsonify({"status": "success", "data": data}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# GET: Dashboard stats (used by CoordinatorDashboard)
# Returns full analytics for both donut charts + bar chart
# ==========================================
@coordinator_bp.route('/dashboard-stats', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        supervisor_profile = Supervisor.query.filter_by(user_id=user_id).first()
        coordinator = Coordinator.query.filter_by(supervisor_id=supervisor_profile.supervisor_id).first()

        if not coordinator:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        year = coordinator.year

        # ── Student counts ──────────────────────────────────────────────────
        total_students = Student.query.filter_by(year=year).count()

        # Students with at least one Pending or Accepted pitch
        pitched_ids = db.session.query(Student.student_id).join(Project_Pitch).filter(
            Student.year == year,
            Project_Pitch.status.in_(['Pending', 'Accepted'])
        ).distinct().all()
        pitched = len(pitched_ids)

        # Students with Accepted pitch = allocated
        allocated = Student.query.filter(
            Student.year == year,
            Student.assigned_supervisor_id.isnot(None)
        ).count()

        # Total pending pitches system-wide for this year
        pending_pitches = Project_Pitch.query.join(Student).filter(
            Student.year == year,
            Project_Pitch.status == 'Pending'
        ).count()

        # Declined
        declined_pitches = Project_Pitch.query.join(Student).filter(
            Student.year == year,
            Project_Pitch.status == 'Declined'
        ).count()

        # Students who have maxed out rejections (all 3 pitches declined)
        max_rejections = db.session.query(Student.student_id).join(Project_Pitch).filter(
            Student.year == year
        ).group_by(Student.student_id).having(
            db.func.count(Project_Pitch.pitch_id.distinct()).filter(
                Project_Pitch.status == 'Declined'
            ) >= 3
        ).count()

        # ── Per-supervisor breakdown (for bar chart) ────────────────────────
        supervisors = Supervisor.query.join(User).filter(User.account_status == 'Accepted').all()
        sup_data = []
        for sup in supervisors:
            acc = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Accepted',
                Student.year == year
            ).count()
            pend = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Pending',
                Student.year == year
            ).count()
            dec = Project_Pitch.query.join(Student).filter(
                Project_Pitch.supervisor_id == sup.supervisor_id,
                Project_Pitch.status == 'Declined',
                Student.year == year
            ).count()
            if acc + pend + dec > 0:  # only include supervisors with activity
                sup_data.append({
                    "name": f"{sup.supervisor_user.first_name} {sup.supervisor_user.last_name}",
                    "accepted": acc,
                    "pending": pend,
                    "declined": dec,
                })

        return jsonify({
            "status": "success",
            "data": {
                "totalStudents":   total_students,
                "pitched":         pitched,
                "pendingPitches":  pending_pitches,
                "declinedPitches": declined_pitches,
                "allocated":       allocated,
                "maxRejections":   max_rejections,
                "supervisors":     sup_data,
            }
        }), 200

    except Exception as e:
        print(f"\n=== DASHBOARD STATS ERROR: {str(e)} ===\n")
        return jsonify({"status": "error", "message": str(e)}), 500