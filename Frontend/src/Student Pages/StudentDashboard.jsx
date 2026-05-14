import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, Navigate } from "react-router-dom"; // Added Navigate here
import NoSupervisor from "./Student Components/NoSupervisors";
import SupervisorSelection from "./Student Dashboard Components/SupervisorSelection";
import PendingPitchDetails from "./Student Dashboard Components/PendingPitchDetails";
import WithdrawModal from "./Student Dashboard Components/WithdrawModal";
import DeclinedPitchDetails from "./Student Dashboard Components/DeclinedPitchDetails";

const StudentDashboard = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [studentStatus, setStudentStatus] = useState("unassigned"); 
  const [assignedData, setAssignedData] = useState(null);

  const [pitches, setPitches] = useState([]); 
  const [viewingPitch, setViewingPitch] = useState(null); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); 

  const fetchDashboardData = async (isNewPitch = false) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        localStorage.clear(); 
        navigate("/"); 
        return; 
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [statusRes, supervisorsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/students/my-status", { headers }),
        fetch("http://127.0.0.1:5000/api/students/available-supervisors", { headers })
      ]);

      if (statusRes.status === 401 || supervisorsRes.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/"); 
        return;
      }

      if (statusRes.ok && supervisorsRes.ok) {
        const statusJson = await statusRes.json();
        const supervisorsJson = await supervisorsRes.json();

        setSupervisors(supervisorsJson.data || []);
        setStudentStatus(statusJson.data.status); 
        
        // Check for "has_pitches" (the new backend status) OR "pending"
        if (statusJson.data.status === "has_pitches" || statusJson.data.status === "pending") {
          
          const activePitches = statusJson.data.pitches || [];
          setPitches(activePitches);

          if (activePitches.length > 0 && (isNewPitch || !viewingPitch)) {
            setViewingPitch(activePitches[activePitches.length - 1]); 
          }
        } else if (statusJson.data.status === "assigned") {
          setAssignedData(statusJson.data.supervisor);
        } else {
          setPitches([]);
          setViewingPitch(null);
        }
      } else {
        toast.error("Failed to load dashboard data.");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Network error. Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

const handleWithdrawPitch = async () => {
    if (!viewingPitch) return;

    try {
        const token = localStorage.getItem("token");
        // Pass the ID directly in the URL path to match your Python route
        const response = await fetch(`http://127.0.0.1:5000/api/students/withdraw-pitch/${viewingPitch.pitch_id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

      if (response.ok) {
        if (isModalOpen) toast.success("Pitch withdrawn successfully.");
        
        setIsModalOpen(false); 
        setViewingPitch(null); 
        fetchDashboardData(); 
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to withdraw pitch.");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Network error.");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[75vh] relative z-0">
      <div className="flex-1 flex flex-col">

        {isLoading ? (
          <div className="p-12 text-center text-[#2b20d6] font-bold animate-pulse">
            Loading dashboard data...
          </div>
        ) : studentStatus === "assigned" ? (
          
          // --- UPDATED: Instantly redirects assigned students to the Project Overview ---
          <Navigate to="/student/project-details" replace />

        ) : viewingPitch?.status === "Declined" ? (

          <DeclinedPitchDetails 
            pitchData={viewingPitch}
            onBack={() => setViewingPitch(null)}
            onPitchAgain={() => {
              handleWithdrawPitch(); 
            }}
          />

        ) : viewingPitch?.status === "Pending" ? (

          <PendingPitchDetails 
            pitchData={viewingPitch} 
            onBack={() => setViewingPitch(null)} 
            onWithdrawClick={() => setIsModalOpen(true)} 
          />

        ) : supervisors.length === 0 ? (
          
          <div className="flex-1 flex items-center justify-center">
            <NoSupervisor />
          </div>

        ) : (
          
          <SupervisorSelection 
            supervisors={supervisors} 
            refreshDashboard={() => fetchDashboardData(true)} 
            activePitches={pitches} 
            onViewPitch={setViewingPitch} 
          />

        )}

      </div>

      <WithdrawModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleWithdrawPitch} 
      />

    </div>
  );
};

export default StudentDashboard;