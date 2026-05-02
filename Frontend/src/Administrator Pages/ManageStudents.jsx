import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import NoStudentFound from './ManageStudentsComponents/NoStudentFound'; 
import StudentDashboardView from './ManageStudentsComponents/StudentDashboardView'; 

const BRAND = "#2b20d6";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch("http://127.0.0.1:5000/api/users/students", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok && data.data && Array.isArray(data.data)) {
          // Map the database fields perfectly
          const formattedStudents = data.data.map(user => ({
            id: user.id || user.user_id,
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
            email: user.email,
            phone: user.phone || user.phone_number,
            
            // Using the precise keys from your Flask backend
            reg: user.reg || user.registration_number || "Not Set", 
            year: user.year || "2",
      
            // FIX: Changed 'student' to 'user' to match the map parameter
            status: user.status === 'Accepted' ? 'Active' : user.status,
            suspension_reason: user.suspension_reason
          }));
          
          setStudents(formattedStudents);
        } else {
          toast.error(data.message || "Failed to fetch student data.");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center p-4">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center font-bold animate-pulse" style={{ color: BRAND }}>
              Loading student registry...
            </div>
        ) : students.length === 0 ? (
            <NoStudentFound />
        ) : (
            <StudentDashboardView students={students} />
        )}
    </div>
  );
}