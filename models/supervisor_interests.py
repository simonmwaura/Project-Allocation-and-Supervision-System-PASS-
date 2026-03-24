from models import db

class Supervisor_Interest(db.Model):
    __tablename__= "supervisor_interest"
    supervisor_id = db.Column(db.Integer, db.ForeignKey("supervisor.supervisor_id"), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey("research_tag.tag_id"), primary_key=True)
    
    # Relationships 
    interests_to_supervisors = db.relationship('Supervisor',back_populates="supervisors_to_interests")
    interests_to_tags = db.relationship("Research_Tag",back_populates="tags_to_interests")
    