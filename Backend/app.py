from flask import Flask,request,jsonify
from flask_migrate import Migrate

app = Flask(__name__)
from models import db,AcademicCycle,Broadcast,Coordinator
from models import Panel_Member,Panel,Project_Pitch
from models import Project_Pitch,Research_Tag,Student_Submission
from models import Student , Submission_Attachment,Supervisor_Interest
from models import Supervisor , Upload_log ,User

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://c:simonmwaura2024@localhost:5432/projectdb'

migrate = Migrate(app,db)
db.init_app(app)
