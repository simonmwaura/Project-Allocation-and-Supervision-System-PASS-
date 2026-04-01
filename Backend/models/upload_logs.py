from models import db,datetime

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