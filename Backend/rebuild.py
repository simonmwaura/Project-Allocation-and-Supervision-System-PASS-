import os
from datetime import datetime, timedelta
from app import app
from models import db, User, Milestone, AcademicCycle

def rebuild():
    with app.app_context():
        print("🚀 Rebuilding database (Empty State with ONLY Admin)...")

        db.drop_all()
        db.create_all()
        print("✅ Tables recreated.")

        # ── Academic Cycle ────────────────────────────────────────────────
        now   = datetime.utcnow()
        cycle = AcademicCycle(label="2025/2026", is_active=True)
        db.session.add(cycle)
        db.session.flush()
        print("✅ Academic cycle created.")

        # ── Milestones ────────────────────────────────────────────────────
        milestones = [
            Milestone(milestone_name="Project Proposal", cycle_id=cycle.cycle_id, year='2', is_required=True, due_date=now + timedelta(weeks=2)),
            Milestone(milestone_name="Final Presentation & Report", cycle_id=cycle.cycle_id, year='2', is_required=True, due_date=now + timedelta(weeks=15)),
            Milestone(milestone_name="Semester 1: Project Proposal", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=4)),
            Milestone(milestone_name="Semester 2: Progress Report", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=18)),
            Milestone(milestone_name="Final Presentation & Report", cycle_id=cycle.cycle_id, year='4', is_required=True, due_date=now + timedelta(weeks=30)),
        ]
        db.session.bulk_save_objects(milestones)
        db.session.commit()
        print("✅ Milestones created.")

        # ── THE SINGLE MASTER ADMIN ───────────────────────────────────────
        try:
            admin_user = User(
                first_name="System",
                last_name="Administrator",
                email="smmx2005@gmail.com",  # Match the MASTER_ADMIN_EMAIL in your route
                user_role="Administrator",
                account_status="Accepted"
            )
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Master Admin Account successfully injected.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to inject Admin account: {e}")

        print("\n✨ Rebuild complete. Database is locked and ready for CSV uploads via the UI.")

if __name__ == "__main__":
    rebuild()