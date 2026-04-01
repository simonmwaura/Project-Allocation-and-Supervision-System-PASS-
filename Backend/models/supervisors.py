from models import db

class Supervisor(db.Model):
    __tablename__= "supervisor"
    supervisor_id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer , db.ForeignKey("user.user_id"),unique=True)
    research_interests = db.Column(db.Text , nullable=True)
    max_2nd_year_capacity = db.Column(db.Integer,nullable= False)
    max_4th_year_capacity = db.Column(db.Integer,nullable= False)

    # Relationships
    supervisor_user = db.relationship('User',back_populates="supervisors")
    supervisor_student = db.relationship('Student',back_populates="student_supervisor")
    supervisors_to_interests = db.relationship('Supervisor_Interest',back_populates="interests_to_supervisors")
    coordinator_profile = db.relationship("Coordinator",back_populates="coordinator_supervisor", uselist=False)
    pitches = db.relationship('Project_Pitch', back_populates='supervisor_in_charge')
    panels_joined = db.relationship('Panel_Member', back_populates='supervisor')