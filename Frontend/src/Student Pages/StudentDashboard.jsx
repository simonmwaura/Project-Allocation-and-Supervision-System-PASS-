import React, { useState, useEffect } from "react";
import NoSupervisor from "./Student Components/NoSupervisors"; // Make sure your path is correct here!

const StudentDashboard = () => {
  // 1. The State
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. The Database Fetch (Simulated)
  useEffect(() => {
    // Simulating a 1-second delay from your Flask backend
    setTimeout(() => {
      setSupervisors([]); // No supervisors found!
      setIsLoading(false); // Done checking
    }, 1000);
  }, []);

  return (
    // FIX: Added min-h-[75vh] to force the container to stretch so items-center works!
    <div className="flex flex-col h-full min-h-[75vh]">
      
      <div className="flex-1 flex flex-col">
        
        {/* THE CONDITIONAL PIPELINE */}
        {isLoading ? (
          
          <div className="p-12 text-center text-[#2b20d6] font-bold animate-pulse">
            Loading supervisor data...
          </div>
          
        ) : supervisors.length === 0 ? (
          
          <div className="flex-1 flex items-center justify-center">
            <NoSupervisor />
          </div>
          
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {supervisors.map(supervisor => (
               <div key={supervisor.id} className="p-4 bg-white rounded-xl shadow border border-blue-200">
                 {supervisor.name}
               </div>
             ))}
          </div>
          
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;