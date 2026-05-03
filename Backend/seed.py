from models import db, AcademicCycle, Broadcast, Coordinator
from models import Panel_Member, Panel, Project_Pitch
from models import Research_Tag, Student_Submission, Milestone
from models import Student, Submission_Attachment, Supervisor_Interest
from models import Supervisor, Upload_log, User
from app import app
from datetime import datetime

print("<-------- Starting to Seed the Database ---------->")

def seed_data():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # -------------------------------------------------------
        # ACADEMIC CYCLES
        # Note: coordinator IDs added after coordinators are created
        # -------------------------------------------------------
        print("Seeding Academic Cycles...")
        cycle1 = AcademicCycle(label='2022/2023', is_active=False)
        cycle2 = AcademicCycle(label='2023/2024', is_active=False)
        cycle3 = AcademicCycle(label='2024/2025', is_active=True)
        db.session.add_all([cycle1, cycle2, cycle3])
        db.session.commit()

        # -------------------------------------------------------
        # USERS (20 total)
        # 2 Coordinator, 4 Supervisor, 12 Student, 2 Administrator
        # -------------------------------------------------------
        print("Seeding Users...")

        # Coordinator users
        u_coord1 = User(first_name='Alice', last_name='Mwangi', email='alice.mwangi@uonbi.ac.ke',
                        phone_number='+254712345678', password='hashed_password',
                        user_role='Coordinator', account_status='Accepted')
        u_coord2 = User(first_name='Bob', last_name='Ochieng', email='bob.ochieng@uonbi.ac.ke',
                        phone_number='+254712345679', password='hashed_password',
                        user_role='Coordinator', account_status='Accepted')

        # Pure supervisor users
        u_sup1 = User(first_name='Carol', last_name='Wanjiku', email='carol.wanjiku@uonbi.ac.ke',
                      phone_number='+254712345680', password='hashed_password',
                      user_role='Supervisor', account_status='Accepted')
        u_sup2 = User(first_name='David', last_name='Kamau', email='david.kamau@uonbi.ac.ke',
                      phone_number='+254712345681', password='hashed_password',
                      user_role='Supervisor', account_status='Accepted')
        u_sup3 = User(first_name='Eve', last_name='Njeri', email='eve.njeri@uonbi.ac.ke',
                      phone_number='+254712345682', password='hashed_password',
                      user_role='Supervisor', account_status='Accepted')
        u_sup4 = User(first_name='Frank', last_name='Otieno', email='frank.otieno@uonbi.ac.ke',
                      phone_number='+254712345683', password='hashed_password',
                      user_role='Supervisor', account_status='Accepted')

        # Student users
        u_std1  = User(first_name='Grace',   last_name='Akinyi',   email='grace.akinyi@students.uonbi.ac.ke',   phone_number='+254712345684', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std2  = User(first_name='Henry',   last_name='Maina',    email='henry.maina@students.uonbi.ac.ke',    phone_number='+254712345685', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std3  = User(first_name='Irene',   last_name='Wangari',  email='irene.wangari@students.uonbi.ac.ke',  phone_number='+254712345686', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std4  = User(first_name='James',   last_name='Mutua',    email='james.mutua@students.uonbi.ac.ke',    phone_number='+254712345687', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std5  = User(first_name='Karen',   last_name='Chebet',   email='karen.chebet@students.uonbi.ac.ke',   phone_number='+254712345688', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std6  = User(first_name='Liam',    last_name='Ngugi',    email='liam.ngugi@students.uonbi.ac.ke',     phone_number='+254712345689', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std7  = User(first_name='Mary',    last_name='Adhiambo', email='mary.adhiambo@students.uonbi.ac.ke',  phone_number='+254712345690', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std8  = User(first_name='Noah',    last_name='Kiprono',  email='noah.kiprono@students.uonbi.ac.ke',   phone_number='+254712345691', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std9  = User(first_name='Olivia',  last_name='Waweru',   email='olivia.waweru@students.uonbi.ac.ke',  phone_number='+254712345692', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std10 = User(first_name='Peter',   last_name='Njoroge',  email='peter.njoroge@students.uonbi.ac.ke',  phone_number='+254712345693', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std11 = User(first_name='Quinn',   last_name='Auma',     email='quinn.auma@students.uonbi.ac.ke',     phone_number='+254712345694', password='hashed_password', user_role='Student', account_status='Accepted')
        u_std12 = User(first_name='Rachel',  last_name='Koech',    email='rachel.koech@students.uonbi.ac.ke',   phone_number='+254712345695', password='hashed_password', user_role='Student', account_status='Accepted')

        # Admin users
        u_admin1 = User(first_name='Samuel', last_name='Oduya', email='samuel.oduya@uonbi.ac.ke',
                        phone_number='+254712345696', password='hashed_password',
                        user_role='Administrator', account_status='Accepted')
        u_admin2 = User(first_name='Tina', last_name='Mugo', email='tina.mugo@uonbi.ac.ke',
                        phone_number='+254712345697', password='hashed_password',
                        user_role='Administrator', account_status='Accepted')

        db.session.add_all([
            u_coord1, u_coord2,
            u_sup1, u_sup2, u_sup3, u_sup4,
            u_std1, u_std2, u_std3, u_std4, u_std5, u_std6,
            u_std7, u_std8, u_std9, u_std10, u_std11, u_std12,
            u_admin1, u_admin2
        ])
        db.session.commit()

        # -------------------------------------------------------
        # SUPERVISORS (6 total)
        # sup1 & sup2 are coordinator users, sup3-6 are pure supervisors
        # -------------------------------------------------------
        print("Seeding Supervisors...")
        sup1 = Supervisor(user_id=u_coord1.user_id, max_2nd_year_capacity=3, max_4th_year_capacity=3)
        sup2 = Supervisor(user_id=u_coord2.user_id, max_2nd_year_capacity=3, max_4th_year_capacity=3)
        sup3 = Supervisor(user_id=u_sup1.user_id,   max_2nd_year_capacity=4, max_4th_year_capacity=4)
        sup4 = Supervisor(user_id=u_sup2.user_id,   max_2nd_year_capacity=4, max_4th_year_capacity=4)
        sup5 = Supervisor(user_id=u_sup3.user_id,   max_2nd_year_capacity=5, max_4th_year_capacity=5)
        sup6 = Supervisor(user_id=u_sup4.user_id,   max_2nd_year_capacity=3, max_4th_year_capacity=3)
        db.session.add_all([sup1, sup2, sup3, sup4, sup5, sup6])
        db.session.commit()

        # -------------------------------------------------------
        # COORDINATORS (2 total)
        # coord1 manages year 2, coord2 manages year 4
        # -------------------------------------------------------
        print("Seeding Coordinators...")
        coord1 = Coordinator(supervisor_id=sup1.supervisor_id, year='2')
        coord2 = Coordinator(supervisor_id=sup2.supervisor_id, year='4')
        db.session.add_all([coord1, coord2])
        db.session.commit()

        # Now update active cycle with coordinator IDs
        cycle3.coordinator_year2_id = coord1.coordinator_id
        cycle3.coordinator_year4_id = coord2.coordinator_id
        db.session.commit()

        # -------------------------------------------------------
        # RESEARCH TAGS (14 total)
        # -------------------------------------------------------
        print("Seeding Research Tags...")
        tag_ai        = Research_Tag(tag_name='Artificial Intelligence')
        tag_ml        = Research_Tag(tag_name='Machine Learning')
        tag_ds        = Research_Tag(tag_name='Data Science')
        tag_cyber     = Research_Tag(tag_name='Cybersecurity')
        tag_web       = Research_Tag(tag_name='Web Development')
        tag_mobile    = Research_Tag(tag_name='Mobile Development')
        tag_iot       = Research_Tag(tag_name='Internet of Things')
        tag_cloud     = Research_Tag(tag_name='Cloud Computing')
        tag_cv        = Research_Tag(tag_name='Computer Vision')
        tag_nlp       = Research_Tag(tag_name='Natural Language Processing')
        tag_blockchain= Research_Tag(tag_name='Blockchain')
        tag_se        = Research_Tag(tag_name='Software Engineering')
        tag_db        = Research_Tag(tag_name='Database Systems')
        tag_hci       = Research_Tag(tag_name='Human-Computer Interaction')
        db.session.add_all([
            tag_ai, tag_ml, tag_ds, tag_cyber, tag_web, tag_mobile,
            tag_iot, tag_cloud, tag_cv, tag_nlp, tag_blockchain,
            tag_se, tag_db, tag_hci
        ])
        db.session.commit()

        # -------------------------------------------------------
        # SUPERVISOR INTERESTS
        # -------------------------------------------------------
        print("Seeding Supervisor Interests...")
        db.session.add_all([
            Supervisor_Interest(supervisor_id=sup1.supervisor_id, tag_id=tag_ai.tag_id),
            Supervisor_Interest(supervisor_id=sup1.supervisor_id, tag_id=tag_ml.tag_id),
            Supervisor_Interest(supervisor_id=sup1.supervisor_id, tag_id=tag_nlp.tag_id),
            Supervisor_Interest(supervisor_id=sup2.supervisor_id, tag_id=tag_cyber.tag_id),
            Supervisor_Interest(supervisor_id=sup2.supervisor_id, tag_id=tag_cloud.tag_id),
            Supervisor_Interest(supervisor_id=sup3.supervisor_id, tag_id=tag_ds.tag_id),
            Supervisor_Interest(supervisor_id=sup3.supervisor_id, tag_id=tag_cv.tag_id),
            Supervisor_Interest(supervisor_id=sup4.supervisor_id, tag_id=tag_web.tag_id),
            Supervisor_Interest(supervisor_id=sup4.supervisor_id, tag_id=tag_mobile.tag_id),
            Supervisor_Interest(supervisor_id=sup4.supervisor_id, tag_id=tag_hci.tag_id),
            Supervisor_Interest(supervisor_id=sup5.supervisor_id, tag_id=tag_iot.tag_id),
            Supervisor_Interest(supervisor_id=sup5.supervisor_id, tag_id=tag_blockchain.tag_id),
            Supervisor_Interest(supervisor_id=sup6.supervisor_id, tag_id=tag_se.tag_id),
            Supervisor_Interest(supervisor_id=sup6.supervisor_id, tag_id=tag_db.tag_id),
        ])
        db.session.commit()

        # -------------------------------------------------------
        # PANELS (4 total — 2 per year, all in active cycle)
        # -------------------------------------------------------
        print("Seeding Panels...")
        panel1 = Panel(cycle_id=cycle3.cycle_id, panel_number='P1-2', year='2', max_capacity=3)
        panel2 = Panel(cycle_id=cycle3.cycle_id, panel_number='P2-2', year='2', max_capacity=3)
        panel3 = Panel(cycle_id=cycle3.cycle_id, panel_number='P1-4', year='4', max_capacity=3)
        panel4 = Panel(cycle_id=cycle3.cycle_id, panel_number='P2-4', year='4', max_capacity=3)
        db.session.add_all([panel1, panel2, panel3, panel4])
        db.session.commit()

        # -------------------------------------------------------
        # PANEL MEMBERS
        # -------------------------------------------------------
        print("Seeding Panel Members...")
        db.session.add_all([
            Panel_Member(panel_id=panel1.panel_id, supervisor_id=sup1.supervisor_id, panel_role='Chair'),
            Panel_Member(panel_id=panel1.panel_id, supervisor_id=sup3.supervisor_id, panel_role='Member'),
            Panel_Member(panel_id=panel2.panel_id, supervisor_id=sup4.supervisor_id, panel_role='Chair'),
            Panel_Member(panel_id=panel2.panel_id, supervisor_id=sup5.supervisor_id, panel_role='Member'),
            Panel_Member(panel_id=panel3.panel_id, supervisor_id=sup2.supervisor_id, panel_role='Chair'),
            Panel_Member(panel_id=panel3.panel_id, supervisor_id=sup6.supervisor_id, panel_role='Member'),
            Panel_Member(panel_id=panel4.panel_id, supervisor_id=sup3.supervisor_id, panel_role='Chair'),
            Panel_Member(panel_id=panel4.panel_id, supervisor_id=sup4.supervisor_id, panel_role='Member'),
        ])
        db.session.commit()

        # -------------------------------------------------------
        # STUDENTS (12 total — 6 year 2, 6 year 4)
        # -------------------------------------------------------
        print("Seeding Students...")
        # Year 2
        std1  = Student(user_id=u_std1.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup3.supervisor_id, registration_number='F17/12345/2022', year='2')
        std2  = Student(user_id=u_std2.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup3.supervisor_id, registration_number='F17/12346/2022', year='2')
        std3  = Student(user_id=u_std3.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup4.supervisor_id, registration_number='F17/12347/2022', year='2')
        std4  = Student(user_id=u_std4.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup4.supervisor_id, registration_number='F17/12348/2022', year='2')
        std5  = Student(user_id=u_std5.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup5.supervisor_id, registration_number='F17/12349/2022', year='2')
        std6  = Student(user_id=u_std6.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=None,               registration_number='F17/12350/2022', year='2')
        # Year 4
        std7  = Student(user_id=u_std7.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup1.supervisor_id, registration_number='F17/09001/2020', year='4')
        std8  = Student(user_id=u_std8.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup1.supervisor_id, registration_number='F17/09002/2020', year='4')
        std9  = Student(user_id=u_std9.user_id,  cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup2.supervisor_id, registration_number='F17/09003/2020', year='4')
        std10 = Student(user_id=u_std10.user_id, cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup2.supervisor_id, registration_number='F17/09004/2020', year='4')
        std11 = Student(user_id=u_std11.user_id, cycle_id=cycle3.cycle_id, assigned_supervisor_id=sup6.supervisor_id, registration_number='F17/09005/2020', year='4')
        std12 = Student(user_id=u_std12.user_id, cycle_id=cycle3.cycle_id, assigned_supervisor_id=None,               registration_number='F17/09006/2020', year='4')
        db.session.add_all([std1, std2, std3, std4, std5, std6, std7, std8, std9, std10, std11, std12])
        db.session.commit()

        # -------------------------------------------------------
        # MILESTONES
        #
        # Year 2 students — 2 milestones:
        #   M1: Project Proposal        → Week 2  (February)
        #   M2: Presentation & Report   → Week 15 (May)
        #
        # Year 4 students — 3 milestones:
        #   M1: Project Proposal        → Semester 1 (November)
        #   M2: Progress Report         → Semester 2 (February)
        #   M3: Final Presentation & Report → Week 15 (May)
        # -------------------------------------------------------
        print("Seeding Milestones...")

        # --- Year 2 ---
        m2_1 = Milestone(
            milestone_name='Milestone 1 - Project Proposal',
            cycle_id=cycle3.cycle_id,
            year='2',
            is_required=True,
            due_date=datetime(2025, 2, 14, 23, 59)   # Week 2
        )
        m2_2 = Milestone(
            milestone_name='Milestone 2 - Presentation & Final Report',
            cycle_id=cycle3.cycle_id,
            year='2',
            is_required=True,
            due_date=datetime(2025, 5, 30, 23, 59)   # Week 15
        )

        # --- Year 4 ---
        m4_1 = Milestone(
            milestone_name='Milestone 1 - Project Proposal',
            cycle_id=cycle3.cycle_id,
            year='4',
            is_required=True,
            due_date=datetime(2024, 11, 29, 23, 59)  # Semester 1
        )
        m4_2 = Milestone(
            milestone_name='Milestone 2 - Progress Report',
            cycle_id=cycle3.cycle_id,
            year='4',
            is_required=True,
            due_date=datetime(2025, 2, 28, 23, 59)   # Semester 2
        )
        m4_3 = Milestone(
            milestone_name='Milestone 3 - Final Presentation & Report',
            cycle_id=cycle3.cycle_id,
            year='4',
            is_required=True,
            due_date=datetime(2025, 5, 30, 23, 59)   # Week 15
        )

        db.session.add_all([m2_1, m2_2, m4_1, m4_2, m4_3])
        db.session.commit()

        # -------------------------------------------------------
        # PROJECT PITCHES (10 total)
        # -------------------------------------------------------
        print("Seeding Project Pitches...")
        p1  = Project_Pitch(student_id=std1.student_id,  supervisor_id=sup3.supervisor_id, project_title='AI-Powered Study Assistant',              abstract='A system that uses NLP to help students study more effectively using adaptive learning techniques.',                                          status='Accepted')
        p2  = Project_Pitch(student_id=std1.student_id,  supervisor_id=sup4.supervisor_id, project_title='Smart Campus Navigation App',             abstract='Mobile app for navigating university campus using IoT sensors and real time positioning.',                                                   status='Declined', decline_reason='Outside supervisor research area')
        p3  = Project_Pitch(student_id=std2.student_id,  supervisor_id=sup3.supervisor_id, project_title='Automated Attendance System',             abstract='Computer vision system for taking lecture attendance automatically using facial recognition.',                                               status='Accepted')
        p4  = Project_Pitch(student_id=std3.student_id,  supervisor_id=sup4.supervisor_id, project_title='Interactive E-Learning Platform',         abstract='A web-based platform for delivering course content with quizzes, progress tracking and gamification.',                                        status='Pending')
        p5  = Project_Pitch(student_id=std4.student_id,  supervisor_id=sup4.supervisor_id, project_title='Student Mental Health Companion App',     abstract='Mobile app connecting students with licensed counseling services and self-assessment tools.',                                                 status='Accepted')
        p6  = Project_Pitch(student_id=std5.student_id,  supervisor_id=sup5.supervisor_id, project_title='Smart Home IoT Controller',               abstract='A centralized dashboard for monitoring and controlling IoT home devices via a mobile interface.',                                             status='Accepted')
        p7  = Project_Pitch(student_id=std7.student_id,  supervisor_id=sup1.supervisor_id, project_title='Federated Learning for Healthcare',       abstract='A privacy-preserving machine learning framework for collaborative model training across hospital datasets.',                                   status='Accepted')
        p8  = Project_Pitch(student_id=std8.student_id,  supervisor_id=sup1.supervisor_id, project_title='Sentiment Analysis on Social Media',      abstract='An NLP pipeline for analysing and visualising public opinion trends on Twitter around political events.',                                     status='Accepted')
        p9  = Project_Pitch(student_id=std9.student_id,  supervisor_id=sup2.supervisor_id, project_title='Blockchain Certificate Verification',     abstract='A decentralised system for issuing and verifying academic credentials using Ethereum smart contracts.',                                       status='Pending')
        p10 = Project_Pitch(student_id=std10.student_id, supervisor_id=sup2.supervisor_id, project_title='Network Intrusion Detection System',      abstract='A machine learning based system for detecting and classifying anomalous traffic patterns in enterprise networks.',                             status='Accepted')
        db.session.add_all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10])
        db.session.commit()

        # -------------------------------------------------------
        # STUDENT SUBMISSION (1) + SUBMISSION ATTACHMENT (1)
        # Seed one sample submission for std1 (Year 2, Milestone 1)
        # -------------------------------------------------------
        print("Seeding Student Submission...")
        sub1 = Student_Submission(
            student_id=std1.student_id,
            milestone_id=m2_1.milestone_id,
            submission_status='On Time'
        )
        db.session.add(sub1)
        db.session.commit()

        print("Seeding Submission Attachment...")
        att1 = Submission_Attachment(
            submission_id=sub1.submission_id,
            file_url='https://storage.uonbi.ac.ke/submissions/grace_akinyi_proposal.pdf',
            file_type='application/pdf'
        )
        db.session.add(att1)
        db.session.commit()

        # -------------------------------------------------------
        # BROADCAST (1)
        # -------------------------------------------------------
        print("Seeding Broadcast...")
        b1 = Broadcast(
            coordinator_id=coord1.coordinator_id,
            title='Proposal Submission Deadline Reminder',
            message='This is a reminder that all 2nd year project proposals are due by 14th February 2025. Ensure your document is uploaded before midnight. Late submissions will be marked accordingly.',
            broadcast_year='2'
        )
        db.session.add(b1)
        db.session.commit()

        # -------------------------------------------------------
        # UPLOAD LOG (1)
        # -------------------------------------------------------
        print("Seeding Upload Log...")
        log1 = Upload_log(
            user_id=u_admin1.user_id,
            filename='2nd_year_students_2024_2025.csv',
            upload_type='2nd Year CSV',
            year='2',
            status='Success',
            records_added=12,
            error_report={}
        )
        db.session.add(log1)
        db.session.commit()

        print("<-------- Seeding Complete! All tables populated. ---------->")
        print("")
        print("Milestone Summary:")
        print("  Year 2 → 2 milestones")
        print("    [1] Milestone 1 - Project Proposal         (Due: Feb 14, 2025)")
        print("    [2] Milestone 2 - Presentation & Report    (Due: May 30, 2025)")
        print("  Year 4 → 3 milestones")
        print("    [1] Milestone 1 - Project Proposal         (Due: Nov 29, 2024)")
        print("    [2] Milestone 2 - Progress Report          (Due: Feb 28, 2025)")
        print("    [3] Milestone 3 - Final Presentation & Report (Due: May 30, 2025)")

seed_data()