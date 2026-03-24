from models import db

class Coordinator(db.Model):
    __tablename__ = 'coordinator'
    coordinator_id = db.Column(db.Integer, primary_key=True)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('supervisor.supervisor_id'), unique=True, nullable=False)
    year = db.Column(db.Enum('2', '4', name='coordinator_year'), nullable=False)

    # Relationships
    coordinator_supervisor = db.relationship('Supervisor', back_populates='coordinator_profile')
    broadcasts = db.relationship('Broadcast', back_populates='author')
    panels = db.relationship('Panel', back_populates='created_by')