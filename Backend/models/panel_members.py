from models import db

class Panel_Member(db.Model):
    __tablename__ = 'panel_member'
    panel_id = db.Column(db.Integer, db.ForeignKey('panel.panel_id'), primary_key=True)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('supervisor.supervisor_id'), primary_key=True)
    panel_role = db.Column(db.Enum('Chair', 'Member', name='panel_roles'), nullable=False)

    # Relationships
    panel = db.relationship('Panel', back_populates='members')
    supervisor = db.relationship('Supervisor', back_populates='panels_joined')