from models import db
from datetime import datetime

class AccountDeletionLog(db.Model):
    __tablename__ = 'account_deletion_log'
    log_id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    deleted_user_email = db.Column(db.String(100), nullable=False)
    deletion_reason = db.Column(db.Text, nullable=False)
    deleted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Link back to the admin who performed the action
    admin_performer = db.relationship('User', foreign_keys=[admin_id])