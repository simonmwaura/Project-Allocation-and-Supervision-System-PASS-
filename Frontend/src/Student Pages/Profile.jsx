import ChangeStudentPassword from "./Student Profile Components/ChangeStudentPassword"
import StudentCard from './Student Profile Components/StudentCard'
import SupervisorContact from "./Student Profile Components/SupervisorContact"

import { useState } from "react"

const Profile = () => {
    const [studentData, setStudentData] = useState({
        profilePicture: "", 
        firstName: "Simon",
        secondName: "Mwaura",
        registrationNumber: "SCS3/148688/2024",
        year: "2",
        phoneNumber: "+254734145632",
        email: "simonmwaura@students.uonbi.ac.ke"
    });

    const [supervisorData, setSupervisorData] = useState({
        name: "Mark Antony",
        email: "mark.antony@uonbi.ac.ke"
    });

    const [passwordData, setPasswordData] = useState({
        password: "",
        confirmPassword: "",
    });

    const fullName = `${studentData.firstName} ${studentData.secondName}`;

    return (
        <div className="flex flex-col h-full items-center w-full pb-10">
            {/* Centered Title */}
            <h2 className="text-3xl font-bold mb-8 text-center w-full" style={{ color: "#302AE2" }}>
                Student Profile
            </h2>
            
            {/* THE FIX IS HERE: grid-cols-1 on mobile, lg:grid-cols-2 on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-8 w-full">
                    <StudentCard 
                        studentData={studentData} 
                        setStudentData={setStudentData} 
                        fullName={fullName} 
                    />
                    <SupervisorContact 
                        supervisorData={supervisorData} 
                    />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-8 w-full">
                    <ChangeStudentPassword 
                        passwordData={passwordData} 
                        setPasswordData={setPasswordData} 
                    />
                </div>

            </div>
        </div>
    );
};

export default Profile;