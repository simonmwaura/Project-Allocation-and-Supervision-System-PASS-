import React, { useState, useEffect } from 'react';
import NoStudentFound from './ManageStudentsComponents/NoStudentFound'; 
import StudentDashboardView from './ManageStudentsComponents/StudentDashboardView'; // <-- Import the new component

const BRAND = "#2b20d6";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating a database fetch
    setTimeout(() => {
      // I populated this with data so you can see the table immediately!
      // To see the NoStudentFound component again, just change this to: setStudents([])
      setStudents([
        { id: 1, name: "Simon Mwaura", reg: "SCS3/148688/2024", year: 2, status: "Active" },
        { id: 2, name: "Peter Kiamba", reg: "P15/147890/2020", year: 4, status: "Pending" },
      ]); 
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    // The transparent flex container to perfectly center whichever component renders
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center p-4">
      
        {isLoading ? (
            <div className="flex flex-col items-center justify-center font-bold animate-pulse" style={{ color: BRAND }}>
              Loading student registry...
            </div>
        ) : students.length === 0 ? (
            
            // Renders if the database is empty
            <NoStudentFound />

        ) : (
            
            // Renders if there are students in the database
            // We pass the students array down as a prop!
            <StudentDashboardView students={students} />

        )}

    </div>
  );
}