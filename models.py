from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer,primary_key=True)
    google_id = db.Column(db.String(255),unique=True,nullable=True)
    first_name = db.Column(db.String(25),nullable=False)
    last_name = db.Column(db.String(25),nullable = False)
    email = db.Column(db.String(100),nullable=False , unique= True)
    phone_number = db.Column(db.String(13),nullable=True)
    password = db.Column(db.String(255),nullable=True)
    user_role = db.Column(db.Enum('Student','Supervisor','Administrator','Coordinator',name='role_types'),nullable=False) 
    account_status = db.Column(db.Enum('Pending', 'Accepted', 'Suspended', name='status_types'), default='Pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    students = db.relationship('Student',back_populates="student_user",uselist=False)
    supervisors = db.relationship('Supervisor',back_populates = "supervisor_user",uselist=False)
    upload_logs = db.relationship('Upload_log',back_populates="csv_attempt")
    
class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer , db.ForeignKey('user.user_id'),unique=True)
    assigned_supervisor_id = db.Column(db.Integer , db.ForeignKey('supervisor.supervisor_id'))
    assigned_panel_id = db.Column()
    registration_number = db.Column(db.String(15),nullable=False)
    year = db.Column(db.Enum('2','4',name="year_levels"),nullable=False)

    # Relationships
    student_user = db.relationship('User',back_populates="students")
    student_supervisor = db.relationship("Supervisor",back_populates="supervisor_student")
    student_assignment_submissions = db.relationship('Student_Submission',back_populates="submissions")

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
    
class Upload_log(db.Model):
    __tablename__ = "upload_log"
    log_id = db.Column(db.Integer , primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    filename = db.Column(db.String(255),nullable=False)
    upload_type = db.Column(db.Enum("Supervisors_CSV","2nd Year CSV","4th Year CSV",name="csv_upload_type"),nullable=False)
    year = db.Column(db.Enum("2","4",name="upload_year"),nullable=True)
    status = db.Column(db.Enum("Success","Partial","Fail",name="upload_status"),nullable=False)
    records_added = db.Column(db.Integer,nullable=False)
    error_report = db.Column(db.JSON,nullable=False)
    uploaded_at = db.Column(db.DateTime,default=datetime.utcnow)
    # Relationship
    csv_attempt = db.relationship("User",back_populates="upload_logs")

class Student_Submission(db.Model):
    __tablename__= "student_submission"
    submission_id = db.Column(db.Integer,primary_key=True)
    student_id = db.Column(db.Integer , db.ForeignKey("student.student_id"))
    milestone_id = db.Column(db.Integer,db.ForeignKey("milestone.milestone_id")) 
    submission_at = db.Column(db.DateTime,default=datetime.utcnow)

    # Relationship
    submissions = db.relationship("Student",back_populates="student_assignment_submissions")

    student_submission_milestone = db.relationship("Milestone",back_populates="milestone_student_submission")

    submission_attachment = db.relationship("Submission_Attachment",back_populates="attachment_submission")

class Milestone(db.Model):
    __tablename__= "milestone"
    milestone_id= db.Column(db.Integer,primary_key=True)
    milestone_name= db.Column(db.String(50),nullable=False)
    year = db.Column(db.Enum('2','4',name="year_levels"),nullable=False)
    is_required = db.Column(db.Boolean ,nullable=False)
    due_date = db.Column(db.DateTime,default=datetime.utcnow)

    # Relationship
    milestone_student_submission= db.relationship("Student_Submission",back_populates="student_submission_milestone")

class Submission_Attachment(db.Model):
    __tablename__="submission_attachment"
    attachment_id = db.Column(db.Integer,primary_key=True)
    submission_id = db.Column(db.Integer,db.ForeignKey("student_submission.submission_id"))
    file_url = db.Column(db.String(250),nullable=False)
    file_type = db.Column(db.String(250),nullable=False)

    # Relationship
    attachment_submission = db.relationship("Student_Submission",back_populates="submission_attachment")
    
class project_pitches(db.Model):
    pass

class supervisor_interests(db.Model):
    pass

class research_tags(db.Model):
    pass

class broadcasts(db.Model):
    pass


class panels(db.Model):
    pass

class panel_members(db.Model):
    pass

