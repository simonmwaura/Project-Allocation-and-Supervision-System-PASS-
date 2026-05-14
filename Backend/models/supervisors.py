from models import db

class Supervisor(db.Model):
    __tablename__ = "supervisor"
    supervisor_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), unique=True)
    max_2nd_year_capacity = db.Column(db.Integer, nullable=False, default=0)
    max_4th_year_capacity = db.Column(db.Integer, nullable=False, default=0)

    # Added during onboarding setup
    office_location = db.Column(db.String(100), nullable=True)
    office_hours    = db.Column(db.String(100), nullable=True)
    bio             = db.Column(db.Text, nullable=True)

    # ---> ADD THIS LINE <---
    supervision_preference = db.Column(db.Text, nullable=True)

    # False until the supervisor completes the first-login setup flow
    onboarding_complete = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    supervisor_user        = db.relationship('User', back_populates="supervisors")
    supervisor_student     = db.relationship('Student', back_populates="student_supervisor")
    supervisors_to_interests = db.relationship('Supervisor_Interest', back_populates="interests_to_supervisors")
    coordinator_profile    = db.relationship("Coordinator", back_populates="coordinator_supervisor", uselist=False)
    pitches                = db.relationship('Project_Pitch', back_populates='supervisor_in_charge')
    panels_joined          = db.relationship('Panel_Member', back_populates='supervisor')