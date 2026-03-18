from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class users(db.Model):
    pass

class students(db.Model):
    pass

class upload_logs(db.Model):
    pass

class milestones(db.Model):
    pass

class student_submissions(db.Model):
    pass

class submission_attachments(db.Model):
    pass

class project_pitches(db.Model):
    pass

class supervisors(db.Model):
    pass

class supervisor_interests(db.Model):
    pass

class research_tags(db.Model):
    pass

class broadcasts(db.Model):
    pass

class coordinators(db.Model):
    pass

class panels(db.Model):
    pass

class panel_members(db.Model):
    pass

