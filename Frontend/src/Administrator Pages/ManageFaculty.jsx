import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import FacultyDashboardView from './Manage Faculty Components/FacultyDashboardView';
import NoFacultyFound from './Manage Faculty Components/NoFacultyFound'; 
// IMPORT THE NEW COMPONENT
import ManageCoordinators from './ManageCoordinators'; 

const BRAND = "#2b20d6";

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW STATE: Controls the Tab Menu
  const [activeTab, setActiveTab] = useState("registry"); 

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch("http://127.0.0.1:5000/api/users/faculty", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok && data.data && Array.isArray(data.data)) {
          // Map the database fields perfectly while protecting against "undefined" names
          const formattedFaculty = data.data.map(user => ({
            id: user.id || user.user_id,
            user_id: user.user_id || user.id,
            
            // Prioritize the pre-formatted name from the backend if it exists
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
            
            role: user.role,
            status: user.status === 'Accepted' ? 'Active' : user.status,
            email: user.email,
            phone: user.phone || user.phone_number,
            suspension_reason: user.suspension_reason
          }));
          
          setFaculty(formattedFaculty);
        } else {
          toast.error(data.message || "Failed to fetch faculty data.");
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
        toast.error("Could not connect to the server.");
      } finally {
        setIsLoading(false); 
      }
    };

    fetchFaculty();
  }, []);

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center p-4">
      
      {/* --- THE INTEGRATION TAB MENU --- */}
      <div className="w-full max-w-6xl flex justify-center mb-4 mt-2">
        <div className="bg-white border border-gray-200 rounded-full p-1.5 flex shadow-sm">
          <button
            onClick={() => setActiveTab("registry")}
            className={`px-6 sm:px-8 py-2.5 rounded-full font-bold text-[14px] transition-all ${
              activeTab === "registry"
                ? "bg-[#2b20d6] text-white shadow-md"
                : "text-gray-500 hover:text-[#2b20d6] hover:bg-blue-50"
            }`}
          >
            Faculty Registry
          </button>
          <button
            onClick={() => setActiveTab("coordinators")}
            className={`px-6 sm:px-8 py-2.5 rounded-full font-bold text-[14px] transition-all ${
              activeTab === "coordinators"
                ? "bg-[#2b20d6] text-white shadow-md"
                : "text-gray-500 hover:text-[#2b20d6] hover:bg-blue-50"
            }`}
          >
            Manage Coordinators
          </button>
        </div>
      </div>

      {/* --- DYNAMIC RENDERING ZONE --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center font-bold animate-pulse h-[50vh]" style={{ color: BRAND }}>
          Loading faculty registry...
        </div>
      ) : activeTab === "coordinators" ? (
        
        // SHOW NEW TAB: Passes the real database faculty list into the dropdowns
        <ManageCoordinators availableFaculty={faculty} />

      ) : faculty.length === 0 ? (
        
        <NoFacultyFound />
        
      ) : (

        // SHOW ORIGINAL TAB: Preserves your KPI cards, Search Bar, and Table!
        <div className="w-full max-w-6xl">
          <FacultyDashboardView faculty={faculty} />
        </div>
        
      )}
    </div>
  );
}