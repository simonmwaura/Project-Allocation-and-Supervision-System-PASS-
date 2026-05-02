from models import db
from datetime import datetime

class Coordinator(db.Model):
    __tablename__ = 'coordinator'
    coordinator_id = db.Column(db.Integer, primary_key=True)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('supervisor.supervisor_id'), unique=True, nullable=False)
    year = db.Column(db.Enum('2', '4', name='coordinator_year'), nullable=False)

    # Relationships
    coordinator_supervisor = db.relationship('Supervisor', back_populates='coordinator_profile')
    broadcasts = db.relationship('Broadcast', back_populates='author')

class CoordinatorHistory(db.Model):
    __tablename__ = 'coordinator_history'
    history_id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Enum('2', '4', name='history_year_enum'), nullable=False)
    
    # We store names as strings so the history remains intact even if a user is deleted later
    previous_coordinator_name = db.Column(db.String(150), nullable=False)
    current_coordinator_name = db.Column(db.String(150), nullable=False)
    
    reassignment_reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)