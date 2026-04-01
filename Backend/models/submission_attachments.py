from models import db

class Submission_Attachment(db.Model):
    __tablename__="submission_attachment"
    attachment_id = db.Column(db.Integer,primary_key=True)
    submission_id = db.Column(db.Integer,db.ForeignKey("student_submission.submission_id"))
    file_url = db.Column(db.String(250),nullable=False)
    file_type = db.Column(db.String(250),nullable=False)

    # Relationship
    attachment_submission = db.relationship("Student_Submission",back_populates="submission_attachment")