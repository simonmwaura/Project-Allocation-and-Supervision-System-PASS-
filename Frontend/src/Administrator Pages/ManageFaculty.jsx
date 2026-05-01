import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Ensure this is imported for error alerts
import FacultyDashboardView from './Manage Faculty Components/FacultyDashboardView';
import NoFacultyFound from './Manage Faculty Components/NoFacultyFound'; 

const BRAND = "#2b20d6";

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // 1. Get the JWT token from local storage
        const token = localStorage.getItem("token");
        
        // 2. Fetch the data from your Flask backend
        const response = await fetch("http://127.0.0.1:5000/api/users/faculty", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok) {
          // 3. Map the database fields to match your React component's expected format
          const formattedFaculty = data.data.map(user => ({
            id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            // Convert 'Accepted' from DB to 'Active' for UI if necessary
            status: user.status === 'Accepted' ? 'Active' : user.status 
          }));
          
          setFaculty(formattedFaculty);
        } else {
          toast.error(data.message || "Failed to fetch faculty data.");
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
        toast.error("Could not connect to the server.");
      } finally {
        setIsLoading(false); // Turn off the loading animation
      }
    };

    fetchFaculty();
  }, []);

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center p-4">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center font-bold animate-pulse" style={{ color: BRAND }}>
              Loading faculty registry...
            </div>
        ) : faculty.length === 0 ? (
            <NoFacultyFound />
        ) : (
            <FacultyDashboardView faculty={faculty} />
        )}
    </div>
  );
}