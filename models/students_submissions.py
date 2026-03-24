from models import db,datetime

class Student_Submission(db.Model):
    __tablename__= "student_submission"
    submission_id = db.Column(db.Integer,primary_key=True)
    student_id = db.Column(db.Integer , db.ForeignKey("student.student_id"))
    milestone_id = db.Column(db.Integer,db.ForeignKey("milestone.milestone_id")) 
    submission_at = db.Column(db.DateTime,default=datetime.utcnow)
    submission_status = db.Column(db.Enum("On Time","Late","Resubmitted",name="submission_status"),nullable=False)

    # Relationship
    submissions = db.relationship("Student",back_populates="student_assignment_submissions")
    student_submission_milestone = db.relationship("Milestone",back_populates="milestone_student_submission")
    submission_attachment = db.relationship("Submission_Attachment",back_populates="attachment_submission")