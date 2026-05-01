from models import db

class AcademicCycle(db.Model):
    __tablename__ = "academic_cycle"
    cycle_id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    coordinator_year2_id = db.Column(db.Integer, db.ForeignKey('coordinator.coordinator_id'), nullable=True)
    coordinator_year4_id = db.Column(db.Integer, db.ForeignKey('coordinator.coordinator_id'), nullable=True)

    # Relationships
    cycle_students = db.relationship("Student", back_populates="students_cycle")
    cycle_milestones = db.relationship("Milestone", back_populates="milestones_cycle")
    cycle_panels = db.relationship("Panel", back_populates="panels_cycle")
    coordinator_2 = db.relationship("Coordinator", foreign_keys=[coordinator_year2_id])
    coordinator_4 = db.relationship("Coordinator", foreign_keys=[coordinator_year4_id])