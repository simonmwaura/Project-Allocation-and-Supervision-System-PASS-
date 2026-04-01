from models import db

class Research_Tag(db.Model):
    __tablename__= "research_tag"
    tag_id = db.Column(db.Integer , primary_key = True)
    tag_name = db.Column(db.String(50) , unique=True, nullable=False)

    # Relationship
    tags_to_interests = db.relationship("Supervisor_Interest",back_populates="interests_to_tags")