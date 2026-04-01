from models import db,datetime

class Project_Pitch(db.Model):
    __tablename__ = 'project_pitch'
    pitch_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('supervisor.supervisor_id'), nullable=False)
    project_title = db.Column(db.String(255), nullable=False)
    abstract = db.Column(db.Text, nullable=False)
    document_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('Pending', 'Accepted', 'Declined', name='pitch_status'), default='Pending', nullable=False)
    decline_reason = db.Column(db.String(255), nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = db.relationship('Student', back_populates='pitches')
    supervisor_in_charge = db.relationship('Supervisor', back_populates='pitches')