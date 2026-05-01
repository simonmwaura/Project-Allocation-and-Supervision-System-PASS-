from models import db

class Panel(db.Model):
    __tablename__ = 'panel'
    panel_id = db.Column(db.Integer, primary_key=True)
    cycle_id = db.Column(db.Integer, db.ForeignKey("academic_cycle.cycle_id"), nullable=False)
    panel_number = db.Column(db.String(5), nullable=False)
    year = db.Column(db.Enum('2', '4', name='panel_year'), nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False, default=3)

    # Relationships
    panels_cycle = db.relationship("AcademicCycle", back_populates="cycle_panels")
    members = db.relationship('Panel_Member', back_populates='panel')