from models import db

class Milestone(db.Model):
    __tablename__= "milestone"
    milestone_id= db.Column(db.Integer,primary_key=True)
    milestone_name= db.Column(db.String(50),nullable=False)
    cycle_id = db.Column(db.Integer , db.ForeignKey("academic_cycle.cycle_id"))
    year = db.Column(db.Enum('2','4',name="year_milestone_levels"),nullable=False)
    is_required = db.Column(db.Boolean ,nullable=False)
    due_date = db.Column(db.DateTime,nullable=False)

    # Relationship
    milestone_student_submission= db.relationship("Student_Submission",back_populates="student_submission_milestone")
    milestones_cycle = db.relationship("AcademicCycle",back_populates="cycle_milestones")