import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSave, FiLock } from "react-icons/fi";

const BRAND = "#2b20d6";

const CoordinatorProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // State aligns with the nested User -> Supervisor -> Coordinator models
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    year: "",
    bio: "",
    officeLocation: ""
  });

  useEffect(() => {
    const fetchCoordinatorData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:5000/api/coordinators/me", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const data = await res.json();
        if (res.ok && data.data) {
          setProfile({
            firstName: data.data.first_name || "N/A",
            lastName: data.data.last_name || "N/A",
            email: data.data.email || "N/A",
            phoneNumber: data.data.phone_number || "",
            year: data.data.year || "N/A",
            bio: data.data.bio || "",
            officeLocation: data.data.office_location || ""
          });
        } else {
          toast.error("Failed to load coordinator profile.");
        }
      } catch (error) {
        toast.error("Network error while fetching profile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoordinatorData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-20">
        <div className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>
          Loading Coordinator Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8" style={{ color: BRAND }}>
        Coordinator Profile
      </h2>
      
      {/* Main Unified Card matching the aesthetic of the provided image */}
      <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-sm w-full">
        
        {/* Top Section: Avatar & Identity */}
        <div className="flex flex-col items-center mb-10">
          <div 
            className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold border-2 border-blue-100 mb-4" 
            style={{ color: BRAND }}
          >
            {profile.firstName && profile.lastName 
              ? `${profile.firstName[0]}${profile.lastName[0]}` 
              : "DC"}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Dr. {profile.firstName !== "N/A" ? profile.firstName : "Simon"} {profile.lastName !== "N/A" ? profile.lastName : "Coordinator"}
          </h3>
          <p className="text-gray-500 font-semibold text-sm mt-1">System Coordinator</p>
        </div>

        <div className="w-full border-t border-gray-100 mb-10"></div>

        {/* Bottom Section: Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Data Fields */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-bold text-gray-500 mb-2 block">Academic Cycle</label>
              <div className="bg-gray-50 px-4 py-3 rounded-lg font-bold text-gray-700 w-24 text-center border border-gray-100">
                {profile.year}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-bold text-gray-500 mb-2 block">Email</label>
              <div className="bg-gray-50 px-4 py-3 rounded-lg font-bold text-gray-600 border border-gray-100">
                {profile.email}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-500 mb-2 block">Phone Number (Read Only)</label>
              <div className="flex gap-2">
                <input 
                  disabled 
                  value={profile.phoneNumber} 
                  className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg font-bold text-gray-600 flex-1"
                  placeholder="Not provided"
                />
                <button 
                  disabled
                  className="bg-blue-100 text-blue-400 p-3 rounded-lg cursor-not-allowed border border-blue-200"
                >
                  <FiSave size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Static Role Info Box */}
          <div className="border border-gray-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-gray-50/50">
             <FiLock size={32} className="mb-4 text-gray-300" />
             <h4 className="font-bold text-gray-600 text-lg mb-2">Coordinator Role</h4>
             <p className="text-sm text-gray-400 font-medium">
               Manage system-wide assignments, panels, and oversee the project workflow for Year {profile.year !== "N/A" ? profile.year : "X"} students.
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CoordinatorProfile;