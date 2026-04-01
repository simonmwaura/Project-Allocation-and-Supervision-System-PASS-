from models import db,AcademicCycle,Broadcast,Coordinator
from models import Panel_Member,Panel,Project_Pitch
from models import Project_Pitch,Research_Tag,Student_Submission
from models import Student , Submission_Attachment,Supervisor_Interest
from models import Supervisor , Upload_log ,User
from app import app

print("<--------Starting to Seed the Database---------->")
def seed_data():
    with app.app_context():
        db.drop_all()
        db.create_all()
        # Academic Cycle
        academic_cycle1 = AcademicCycle(label = '2024/2025',is_active='False')
        db.session.add(academic_cycle1)
        db.session.commit()

        # Do Users
        user1= User(google_id='dsfdfldsvbsdbdfhfghdfdfbdfhhghfgh',first_name="Martin",last_name = "Kwame",email='martinkwame@students.uonbi.ac.ke',phone_number="+25471456334566",password="password123",user_role="Student",account_status('Pending'),)

        # Do Upload Log
        # Do Supervisors
        # Do Research Tags
        # Do Supervisor Interests
        # Do Coordinator
        # Do Broadcast
        # Do Panel
        # Do Panel members
        # Do students
        # Do Poject Pitches
        # Do Stubmission attachments
        # Do Milestones
        # Do Student Submission
        


        
        


        

seed_data()

