import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProfileCard from "./Supervisor Profile Components/ProfileCard";
import EditAccountDetails from "./Supervisor Profile Components/EditAccountDetails";
import ResearchInterests from "./Supervisor Profile Components/ResearchInterests";
import BioAndOfficeDetails from "./Supervisor Profile Components/BioAndOfficeDetails"; // <-- NEW IMPORT
import ChangePassword from "./Supervisor Profile Components/ChangePassword";

const BRAND = "#302AE2";

const SupervisorProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "Loading...",
    email: "Loading...",
    phoneNumber: "",
    interests: [],
    bio: "",
    officeLocation: "",
    officeHours: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/supervisors/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        setProfileData({
          fullName: `Dr. ${data.data.first_name} ${data.data.last_name}`,
          email: data.data.email,
          phoneNumber: data.data.phone_number || "",
          
          // --- Mapping the real onboarding data ---
          bio: data.data.bio || "No bio provided.",
          officeLocation: data.data.office_location || "Not set",
          officeHours: data.data.office_hours || "Not set",
          interests: data.data.research_interests || []
        });
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (isLoading) {
    return <div className="text-center pt-20 font-bold animate-pulse text-blue-600">Loading profile...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <h2 className="text-3xl font-bold text-center mb-2" style={{ color: BRAND }}>
        Supervisor Profile
      </h2>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard profileData={profileData} />
        </div>
        <div className="lg:col-span-2">
          <EditAccountDetails profileData={profileData} refreshData={fetchProfileData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResearchInterests interests={profileData.interests} />
        
        {/* Render the new component with the onboarding data */}
        <BioAndOfficeDetails 
  bio={profileData.bio} 
  location={profileData.officeLocation} 
  hours={profileData.officeHours}
  preference={profileData.preferences} // Pass the preferences here
  refreshData={fetchProfileData} // Essential for the toasts to feel "real"
/>
        
        <ChangePassword />
      </div>
    </div>
  );
};

export default SupervisorProfile;