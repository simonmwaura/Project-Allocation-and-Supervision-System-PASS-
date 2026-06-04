from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, User, Supervisor, Coordinator, CoordinatorHistory,
    Panel, AcademicCycle, Panel_Member, Student, Project_Pitch,
    Broadcast, Milestone
)
from sqlalchemy import cast, Integer

coordinator_bp = Blueprint('coordinator', __name__)

# ── helpers ───────────────────────────────────────────────────────────────────
def _get_coordinator(user_id):
    """Return (supervisor, coordinator) or (None, None) if not found."""
    sup   = Supervisor.query.filter_by(user_id=user_id).first()
    coord = Coordinator.query.filter_by(supervisor_id=sup.supervisor_id).first() if sup else None
    return sup, coord

def _chair_name(panel_id):
    """Return the name of the Chair member of a panel, or 'Unassigned'."""
    chair_member = Panel_Member.query.filter_by(
        panel_id=panel_id, panel_role='Chair'
    ).first()
    if not chair_member:
        return "Unassigned", None
    sup  = Supervisor.query.get(chair_member.supervisor_id)
    user = User.query.get(sup.user_id) if sup else None
    if user:
        return f"{user.first_name} {user.last_name}", chair_member.supervisor_id
    return "Unassigned", None

def _panel_members(panel_id):
    """Return list of {id, name, role} dicts for a panel."""
    members = []
    for pm in Panel_Member.query.filter_by(panel_id=panel_id).all():
        sup  = Supervisor.query.get(pm.supervisor_id)
        user = User.query.get(sup.user_id) if sup else None
        if user:
            members.append({
                "id":   pm.supervisor_id,
                "name": f"{user.first_name} {user.last_name}",
                "role": pm.panel_role,
            })
    return members


# ==========================================
# 1. GET: Current Coordinators (Admin use)
# ==========================================
@coordinator_bp.route('', methods=['GET'], strict_slashes=False)
@coordinator_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_coordinators():
    try:
        coordinators = Coordinator.query.all()
        data = {"2": None, "4": None}
        for coord in coordinators:
            sup  = Supervisor.query.get(coord.supervisor_id)
            user = User.query.get(sup.user_id) if sup else None
            if user:
                data[str(coord.year)] = {
                    "id": user.user_id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                }
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 1.5. GET: Coordinator Reassignment History
# ==========================================
@coordinator_bp.route('/history', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_coordinator_history():
    try:
        records = CoordinatorHistory.query.order_by(CoordinatorHistory.history_id.desc()).all()
        data = []
        for r in records:
            date_str = r.created_at.strftime("%b %d, %Y") if (hasattr(r, 'created_at') and r.created_at) else "N/A"
            data.append({
                "id":                   r.history_id,
                "date":                 date_str,
                "year":                 r.year,
                "previous_coordinator": r.previous_coordinator_name,
                "current_coordinator":  r.current_coordinator_name,
                "reason":               r.reassignment_reason,
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 2. POST: Reassign Coordinator
# ==========================================
@coordinator_bp.route('/reassign', methods=['POST'], strict_slashes=False)
@jwt_required()
def reassign_coordinator():
    try:
        data        = request.get_json()
        target_year = str(data.get('year'))
        new_user_id = data.get('new_coordinator_id')
        reason      = data.get('reason')

        new_user = User.query.get(new_user_id)
        new_sup  = Supervisor.query.filter_by(user_id=new_user_id).first()
        if not new_sup:
            return jsonify({"status": "error", "message": "Selected user is not a supervisor."}), 400

        existing = Coordinator.query.filter_by(year=target_year).first()
        prev_name = "None"

        if existing:
            old_sup  = Supervisor.query.get(existing.supervisor_id)
            old_user = User.query.get(old_sup.user_id) if old_sup else None
            if old_user:
                old_user.user_role = 'Supervisor'
                prev_name = f"{old_user.first_name} {old_user.last_name}"
            existing.supervisor_id = new_sup.supervisor_id
        else:
            db.session.add(Coordinator(supervisor_id=new_sup.supervisor_id, year=target_year))

        new_user.user_role = 'Coordinator'
        db.session.add(CoordinatorHistory(
            year=target_year,
            previous_coordinator_name=prev_name,
            current_coordinator_name=f"{new_user.first_name} {new_user.last_name}",
            reassignment_reason=reason,
        ))
        db.session.commit()
        return jsonify({"status": "success", "message": "Reassigned successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 3. GET: All Panels for this Coordinator's year
# ==========================================
@coordinator_bp.route('/panels', methods=['GET'])
@jwt_required()
def get_panels():
    try:
        user_id    = get_jwt_identity()
        _, coord   = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 403

        panels = (
            Panel.query
            .filter_by(year=coord.year)
            .order_by(cast(Panel.panel_number, Integer).asc())
            .all()
        )

        data = []
        for p in panels:
            chair_name, _ = _chair_name(p.panel_id)
            data.append({
                "panelId":     p.panel_id,
                "panelNumber": p.panel_number,
                "chairName":   chair_name,
                "memberCount": Panel_Member.query.filter_by(panel_id=p.panel_id).count(),
                "maxCapacity": p.max_capacity or 3,
                "studentCount": 0,
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 4. POST: Generate Panels (max 6 per year)
# ==========================================
@coordinator_bp.route('/generate-panels', methods=['POST'])
@jwt_required()
def generate_panels():
    try:
        data            = request.get_json()
        requested_count = int(data.get('count', 0))
        user_id         = get_jwt_identity()
        _, coord        = _get_coordinator(user_id)

        if not coord:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 403

        current_count = Panel.query.filter_by(year=coord.year).count()
        if current_count >= 6:
            return jsonify({"status": "error", "message": "Maximum limit of 6 panels reached."}), 400
        if current_count + requested_count > 6:
            return jsonify({"status": "error", "message": f"You can only add {6 - current_count} more panels."}), 400

        active_cycle = AcademicCycle.query.filter_by(is_active=True).first()
        if not active_cycle:
            return jsonify({"status": "error", "message": "No active academic cycle found."}), 400

        last_panel = (
            Panel.query
            .filter_by(year=coord.year)
            .order_by(cast(Panel.panel_number, Integer).desc())
            .first()
        )
        start_num = (int(last_panel.panel_number) + 1) if last_panel else 1

        for i in range(requested_count):
            db.session.add(Panel(
                panel_number=str(start_num + i),
                cycle_id=active_cycle.cycle_id,
                max_capacity=3,
                year=coord.year,
            ))

        db.session.commit()
        return jsonify({"status": "success", "message": f"Generated {requested_count} panels."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 5. DELETE: All Panels for this year
# ==========================================
@coordinator_bp.route('/panels/delete-all', methods=['DELETE'])
@jwt_required()
def delete_all_panels():
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        # Delete Panel_Member rows first (FK constraint)
        panel_ids = [p.panel_id for p in Panel.query.filter_by(year=coord.year).all()]
        Panel_Member.query.filter(Panel_Member.panel_id.in_(panel_ids)).delete(synchronize_session=False)
        Panel.query.filter_by(year=coord.year).delete()
        db.session.commit()
        return jsonify({"status": "success", "message": "All panels cleared."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 6. GET: Single Panel Details
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>', methods=['GET'])
@jwt_required()
def get_single_panel(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        chair_name, chair_sup_id = _chair_name(panel_id)

        return jsonify({
            "status": "success",
            "data": {
                "panelId":     panel.panel_id,
                "panelNumber": panel.panel_number,
                "chairName":   chair_name,
                "chairId":     chair_sup_id,   # supervisor_id of the chair, or None
                "maxCapacity": panel.max_capacity or 4,
                "studentCount": 0,
                "members":     _panel_members(panel_id),
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 7. DELETE: Individual Panel
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>', methods=['DELETE'])
@jwt_required()
def delete_panel(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        # Remove members first
        Panel_Member.query.filter_by(panel_id=panel_id).delete()
        db.session.delete(panel)
        db.session.commit()
        return jsonify({"status": "success", "message": "Panel deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 8. PUT: Update Panel Settings (capacity + chair)
# Chair is stored as Panel_Member with panel_role='Chair'
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/settings', methods=['PUT'])
@jwt_required()
def update_panel_settings(panel_id):
    try:
        data         = request.get_json()
        panel        = Panel.query.get_or_404(panel_id)
        new_capacity = data.get('max_capacity')
        new_chair_id = data.get('chair_id')  # supervisor_id

        if new_capacity in [3, 4]:
            panel.max_capacity = new_capacity

        if new_chair_id:
            # Demote any existing Chair to Member
            Panel_Member.query.filter_by(
                panel_id=panel_id, panel_role='Chair'
            ).update({"panel_role": "Member"})
            # Promote the chosen member to Chair
            target = Panel_Member.query.filter_by(
                panel_id=panel_id, supervisor_id=new_chair_id
            ).first()
            if target:
                target.panel_role = 'Chair'

        db.session.commit()
        return jsonify({"status": "success", "message": "Settings updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 9. GET: Eligible Supervisors for a Panel
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/eligible-supervisors', methods=['GET'])
@jwt_required()
def get_eligible_supervisors(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)

        occupied_ids = [
            r[0] for r in
            db.session.query(Panel_Member.supervisor_id)
            .join(Panel)
            .filter(Panel.cycle_id == panel.cycle_id)
            .all()
        ]

        eligible = (
            Supervisor.query
            .join(User)
            .filter(User.account_status == 'Accepted',
                    Supervisor.supervisor_id.not_in(occupied_ids))
            .all()
        )

        data = [{
            "id":    s.supervisor_id,
            "name":  f"{s.supervisor_user.first_name} {s.supervisor_user.last_name}",
            "email": s.supervisor_user.email,
        } for s in eligible]

        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 10. POST: Add Supervisor to Panel
# ==========================================
@coordinator_bp.route('/panels/<int:panel_id>/add-member', methods=['POST'])
@jwt_required()
def add_panel_member(panel_id):
    try:
        data   = request.get_json()
        sup_id = data.get('supervisor_id')
        panel  = Panel.query.get_or_404(panel_id)

        current = Panel_Member.query.filter_by(panel_id=panel_id).count()
        if current >= (panel.max_capacity or 4):
            return jsonify({"status": "error", "message": "Panel has reached maximum capacity."}), 400

        # First member automatically becomes Chair
        role = 'Chair' if current == 0 else 'Member'
        db.session.add(Panel_Member(panel_id=panel_id, supervisor_id=sup_id, panel_role=role))
        db.session.commit()
        return jsonify({"status": "success", "message": "Supervisor added to panel."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 11. GET: Coordinator Profile (/me)
# ==========================================
@coordinator_bp.route('/me', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_my_coordinator_profile():
    try:
        user_id      = get_jwt_identity()
        user         = User.query.get(user_id)
        sup, coord   = _get_coordinator(user_id)
        if not sup or not coord:
            return jsonify({"status": "error", "message": "Coordinator profile not found"}), 404
        return jsonify({
            "status": "success",
            "data": {
                "first_name":   user.first_name,
                "last_name":    user.last_name,
                "email":        user.email,
                "phone_number": user.phone_number,
                "year":         coord.year,
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 12. GET: Supervisors Overview
# ==========================================
@coordinator_bp.route('/supervisors-overview', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_supervisors_overview():
    try:
        user_id    = get_jwt_identity()
        _, coord   = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        supervisors = Supervisor.query.join(User).filter(User.account_status == 'Accepted').all()
        data = []
        for sup in supervisors:
            max_cap = sup.max_2nd_year_capacity if coord.year == '2' else sup.max_4th_year_capacity

            def pitch_count(status):
                return (
                    Project_Pitch.query.join(Student)
                    .filter(Project_Pitch.supervisor_id == sup.supervisor_id,
                            Project_Pitch.status == status,
                            Student.year == coord.year)
                    .count()
                )

            data.append({
                "id":             sup.supervisor_id,
                "firstName":      sup.supervisor_user.first_name,
                "lastName":       sup.supervisor_user.last_name,
                "email":          sup.supervisor_user.email,
                "maxCapacity":    max_cap,
                "max2ndYear":     sup.max_2nd_year_capacity,
                "max4thYear":     sup.max_4th_year_capacity,
                "accepted":       pitch_count('Accepted'),
                "pendingPitches": pitch_count('Pending'),
                "declined":       pitch_count('Declined'),
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 13. GET: Students Overview
# ==========================================
@coordinator_bp.route('/students-overview', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_students_overview():
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        students = Student.query.filter_by(year=coord.year).all()
        data = []
        for student in students:
            status          = "Unassigned"
            supervisor_name = None

            accepted_pitch  = Project_Pitch.query.filter_by(student_id=student.student_id, status='Accepted').first()
            pending_count   = Project_Pitch.query.filter_by(student_id=student.student_id, status='Pending').count()

            if accepted_pitch:
                status = "Assigned"
                sup_user = accepted_pitch.supervisor_in_charge.supervisor_user
                supervisor_name = f"Dr. {sup_user.first_name} {sup_user.last_name}"
            elif pending_count > 0:
                status = "Pitching"

            data.append({
                "id":        student.student_id,
                "firstName": student.student_user.first_name,
                "lastName":  student.student_user.last_name,
                "regNumber": student.registration_number,
                "email":     student.student_user.email,
                "status":    status,
                "supervisor": supervisor_name,
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 14. GET / POST: Broadcasts
# ==========================================
@coordinator_bp.route('/broadcasts', methods=['GET', 'POST'], strict_slashes=False)
@jwt_required()
def handle_broadcasts():
    user_id  = get_jwt_identity()
    _, coord = _get_coordinator(user_id)
    if not coord:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    if request.method == 'POST':
        try:
            data    = request.get_json()
            title   = data.get('title')
            message = data.get('message')
            if not title or not message:
                return jsonify({"status": "error", "message": "Title and message are required."}), 400
            db.session.add(Broadcast(
                coordinator_id=coord.coordinator_id,
                title=title,
                message=message,
                broadcast_year=coord.year,
            ))
            db.session.commit()
            return jsonify({"status": "success", "message": "Broadcast sent successfully."}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500

    # GET
    try:
        broadcasts = (
            Broadcast.query
            .filter_by(coordinator_id=coord.coordinator_id)
            .order_by(Broadcast.broadcast_id.desc())
            .all()
        )
        data = []
        for b in broadcasts:
            author_user = b.author.coordinator_supervisor.supervisor_user
            date_str = b.created_at.strftime("%b %d") if (hasattr(b, 'created_at') and b.created_at) else "Recently"
            data.append({
                "id":      b.broadcast_id,
                "title":   b.title,
                "message": b.message,
                "date":    date_str,
                "author":  f"Dr. {author_user.first_name} - Project Coordinator",
                "year":    b.broadcast_year,
            })
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 15. GET: Dashboard Stats
# ==========================================
@coordinator_bp.route('/dashboard-stats', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_dashboard_stats():
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        year = coord.year

        total_students = Student.query.filter_by(year=year).count()

        pitched_ids = (
            db.session.query(Student.student_id)
            .join(Project_Pitch)
            .filter(Student.year == year, Project_Pitch.status.in_(['Pending', 'Accepted']))
            .distinct()
            .all()
        )
        pitched = len(pitched_ids)

        allocated = Student.query.filter(
            Student.year == year,
            Student.assigned_supervisor_id.isnot(None)
        ).count()

        pending_pitches = (
            Project_Pitch.query.join(Student)
            .filter(Student.year == year, Project_Pitch.status == 'Pending')
            .count()
        )
        declined_pitches = (
            Project_Pitch.query.join(Student)
            .filter(Student.year == year, Project_Pitch.status == 'Declined')
            .count()
        )

        max_rejections = (
            db.session.query(Student.student_id)
            .join(Project_Pitch)
            .filter(Student.year == year)
            .group_by(Student.student_id)
            .having(
                db.func.count(
                    db.case((Project_Pitch.status == 'Declined', Project_Pitch.pitch_id))
                ) >= 3
            )
            .count()
        )

        supervisors = Supervisor.query.join(User).filter(User.account_status == 'Accepted').all()
        sup_data = []
        for sup in supervisors:
            def sc(status):
                return (
                    Project_Pitch.query.join(Student)
                    .filter(Project_Pitch.supervisor_id == sup.supervisor_id,
                            Project_Pitch.status == status, Student.year == year)
                    .count()
                )
            acc, pend, dec = sc('Accepted'), sc('Pending'), sc('Declined')
            if acc + pend + dec > 0:
                sup_data.append({
                    "name":     f"{sup.supervisor_user.first_name} {sup.supervisor_user.last_name}",
                    "accepted": acc,
                    "pending":  pend,
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


# ==========================================
# 16. PATCH: Override Supervisor Capacity
# ==========================================
@coordinator_bp.route('/supervisors/<int:supervisor_id>/override-capacity', methods=['PATCH'])
@jwt_required()
def override_supervisor_capacity(supervisor_id):
    try:
        user_id      = get_jwt_identity()
        _, coord     = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data         = request.get_json()
        new_capacity = int(data.get('capacity', 0))
        year         = str(data.get('year', coord.year))

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
# 17. POST: Nudge Supervisor
# ==========================================
@coordinator_bp.route('/supervisors/<int:supervisor_id>/nudge', methods=['POST'])
@jwt_required()
def nudge_supervisor(supervisor_id):
    try:
        target_sup = Supervisor.query.get(supervisor_id)
        if not target_sup:
            return jsonify({"status": "error", "message": "Supervisor not found."}), 404
        sup_user = User.query.get(target_sup.user_id)
        print(f"[NUDGE] Reminder triggered for {sup_user.email}")
        return jsonify({"status": "success", "message": f"Reminder logged for {sup_user.email}."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==========================================
# 18. GET / PATCH / DELETE: Milestones
# ==========================================
@coordinator_bp.route('/milestones', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_coordinator_milestones():
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        milestones = Milestone.query.order_by(Milestone.milestone_id.asc()).all()
        data = [{
            "id":      m.milestone_id,
            "name":    m.milestone_name,
            "dueDate": str(m.due_date) if m.due_date else "TBD",
        } for m in milestones]
        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@coordinator_bp.route('/milestones/update-deadline', methods=['PATCH'], strict_slashes=False)
@jwt_required()
def update_milestone_deadline():
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data           = request.get_json()
        milestone_name = data.get('milestone_name')
        due_date       = data.get('due_date')

        if not milestone_name or not due_date:
            return jsonify({"status": "error", "message": "Milestone name and due date are required."}), 400

        milestone = Milestone.query.filter_by(milestone_name=milestone_name).first()
        if not milestone:
            return jsonify({"status": "error", "message": "Milestone not found."}), 404

        milestone.due_date = due_date
        db.session.commit()
        return jsonify({"status": "success", "message": f"{milestone_name} deadline updated."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@coordinator_bp.route('/milestones/<int:milestone_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_milestone(milestone_id):
    try:
        user_id  = get_jwt_identity()
        _, coord = _get_coordinator(user_id)
        if not coord:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        milestone = Milestone.query.get(milestone_id)
        if not milestone:
            return jsonify({"status": "error", "message": "Milestone not found."}), 404

        db.session.delete(milestone)
        db.session.commit()
        return jsonify({"status": "success", "message": "Milestone deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500