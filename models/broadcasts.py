from models import db

class Broadcast(db.Model):
    __tablename__ = 'broadcast'
    broadcast_id = db.Column(db.Integer, primary_key=True)
    coordinator_id = db.Column(db.Integer, db.ForeignKey('coordinator.coordinator_id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(255), nullable=True)
    broadcast_year = db.Column(db.Enum("2","4",name="broadcast_year"),nullable=False)

    # Relationship
    author = db.relationship('Coordinator', back_populates='broadcasts')