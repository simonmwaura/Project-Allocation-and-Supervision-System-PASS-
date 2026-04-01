from models import db

class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer , db.ForeignKey('user.user_id'),unique=True)
    cycle_id = db.Column(db.Integer , db.ForeignKey("academic_cycle.cycle_id"))
    assigned_supervisor_id = db.Column(db.Integer , db.ForeignKey('supervisor.supervisor_id'))
    assigned_panel_id = db.Column(db.Integer, db.ForeignKey('panel.panel_id'), nullable=True)
    registration_number = db.Column(db.String(15),nullable=False)
    year = db.Column(db.Enum('2','4',name="year_levels"),nullable=False)

    # Relationships
    student_user = db.relationship('User',back_populates="students")
    student_supervisor = db.relationship("Supervisor",back_populates="supervisor_student")
    student_assignment_submissions = db.relationship('Student_Submission',back_populates="submissions")
    panel_assigned = db.relationship('Panel', back_populates='students_assigned')
    pitches = db.relationship('Project_Pitch', back_populates='student')
    students_cycle = db.relationship("AcademicCycle",back_populates="cycle_students")