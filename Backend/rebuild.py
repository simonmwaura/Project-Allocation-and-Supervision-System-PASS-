import os
from datetime import datetime, timedelta
from app import app
from models import db, Milestone, AcademicCycle

def restore_milestones():
    with app.app_context():
        print("🚀 Restoring Milestones...")

        # 1. Get the current active cycle (so we attach them to the right year)
        cycle = AcademicCycle.query.filter_by(is_active=True).first()
        
        if not cycle:
            print("⚠️ No active cycle found. Creating one...")
            cycle = AcademicCycle(label="2025/2026", is_active=True)
            db.session.add(cycle)
            db.session.flush()

        now = datetime.utcnow()
        
        # 2. Define the exact milestones from your original script
        milestones = [
            Milestone(milestone_name="Project Proposal", cycle_id=cycle.cycle_id, year='2', is_required=True, due_date=now + timedelta(weeks=2)),
            Milestone(milestone_name="Final Presentation & Report", cycle_id=cycle.cycle_id, year='2', is_required=True, due_date=now + timedelta(weeks=15)),
            Milestone(milestone_name="Semester 1: Project Proposal", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=4)),
            Milestone(milestone_name="Semester 2: Progress Report", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=18)),
            Milestone(milestone_name="Final Presentation & Report", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=30)),
        ]

        try:
            # 3. Clear any weird ghost milestones just in case, then bulk save
            db.session.query(Milestone).delete()
            db.session.bulk_save_objects(milestones)
            db.session.commit()
            print("✅ Milestones successfully restored!")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to restore milestones: {e}")

if __name__ == "__main__":
    restore_milestones()