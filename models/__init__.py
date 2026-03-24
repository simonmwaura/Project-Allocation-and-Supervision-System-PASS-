from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

from .academic_cycle import AcademicCycle
from .broadcasts import Broadcast
from .coordinators import Coordinator
from .milestones import Milestone
from .panel_members import Panel_Member
from .panels import Panel
from .project_pitches import Project_Pitch
from .research_tags import Research_Tag
from .students_submissions import Student_Submission
from .students import Student
from .submission_attachments import Submission_Attachment
from .supervisor_interests import Supervisor_Interest
from .supervisors import Supervisor
from .upload_logs import Upload_log
from .users import User

