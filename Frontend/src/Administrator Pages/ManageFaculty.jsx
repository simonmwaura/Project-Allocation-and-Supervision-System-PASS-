import React, { useState, useEffect } from 'react';
import FacultyDashboardView from './Manage Faculty Components/FacultyDashboardView';
import NoFacultyFound from './Manage Faculty Components/NoFacultyFound'; // <-- Import the new component

const BRAND = "#2b20d6";

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating a database fetch
    setTimeout(() => {
      // Set to an empty array so you can instantly see the NoFacultyFound component!
      // (To see the table again, just put the mock data back in here)
     setFaculty([
        { id: 1, name: "Simon Mwaura", role: "Supervisor / Coordinator", status: "Active" },
        { id: 2, name: "Peter Kiamba", role: "Supervisor", status: "Pending" },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center p-4">
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center font-bold animate-pulse" style={{ color: BRAND }}>
              Loading faculty registry...
            </div>
        ) : faculty.length === 0 ? (
            
            // Renders the new empty state component
            <NoFacultyFound />

        ) : (
            
            // Renders the main data table dashboard
            <FacultyDashboardView faculty={faculty} />

        )}

    </div>
  );
}