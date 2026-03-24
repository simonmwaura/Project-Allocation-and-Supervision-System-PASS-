from models import db,datetime

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