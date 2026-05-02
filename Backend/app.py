from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager  
from flask_cors import CORS 

from models import db, AcademicCycle, Broadcast, Coordinator
from models import Panel_Member, Panel, Project_Pitch
from models import Research_Tag, Student_Submission
from models import Student, Submission_Attachment, Supervisor_Interest
from models import Supervisor, Upload_log, User

from routes.user_routes import user_bp
from routes.administrator_routes import admin_bp
from routes.student_routes import student_bp
from routes.coordinator_routes import coordinator_bp

# ---> NEW: Import your upload routes <---
from routes.upload_routes import upload_bp 

app = Flask(__name__)
CORS(app) 

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://c:simonmwaura2024@localhost:5432/projectdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ---> JWT CONFIGURATION <---
app.config['JWT_SECRET_KEY'] = 'your-super-secret-key-change-this-later' # Keep this secret!
jwt = JWTManager(app)

db.init_app(app)
migrate = Migrate(app, db)

# Register all Blueprints
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(student_bp, url_prefix='/api/students')
app.register_blueprint(coordinator_bp, url_prefix='/api/coordinators')

# Notice how both of these share the '/api/admin' prefix! 
# Flask will automatically merge them together perfectly.
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(upload_bp, url_prefix='/api/admin') 


if __name__ == '__main__':
    app.run(debug=True)