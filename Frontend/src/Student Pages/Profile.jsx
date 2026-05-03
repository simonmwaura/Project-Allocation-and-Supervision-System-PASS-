import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ChangeStudentPassword from "./Student Profile Components/ChangeStudentPassword";
import StudentCard from "./Student Profile Components/StudentCard";
import SupervisorContact from "./Student Profile Components/SupervisorContact";

const BRAND = "#302AE2";

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [studentData, setStudentData] = useState({
    profilePicture: "",
    firstName: "",
    secondName: "",
    registrationNumber: "",
    year: "",
    phoneNumber: "",
    email: "",
  });

  const [supervisorData, setSupervisorData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Parallel fetch for profile and assignment status
        const [profileRes, statusRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/students/me", { headers }),
          fetch("http://127.0.0.1:5000/api/students/my-status", { headers }),
        ]);

        const profileJson = await profileRes.json();
        const statusJson = await statusRes.json();

        if (profileRes.ok) {
          const d = profileJson.data;
          setStudentData({
            firstName: d.first_name,
            secondName: d.last_name,
            registrationNumber: d.registration_number,
            year: String(d.year),
            phoneNumber: d.phone_number || "Not set",
            email: d.email,
          });
        }

        if (statusRes.ok && statusJson.data?.status === "assigned") {
          setSupervisorData(statusJson.data.supervisor);
        }
      } catch (error) {
        toast.error("Network error. Could not load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-20">
        <div className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center w-full pb-10">
      <h2 className="text-3xl font-bold mb-8 text-center w-full" style={{ color: BRAND }}>
        Student Profile
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="flex flex-col gap-8 w-full">
          <StudentCard
            studentData={studentData}
            setStudentData={setStudentData}
            fullName={`${studentData.firstName} ${studentData.secondName}`}
          />
          {supervisorData && <SupervisorContact supervisorData={supervisorData} />}
        </div>
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