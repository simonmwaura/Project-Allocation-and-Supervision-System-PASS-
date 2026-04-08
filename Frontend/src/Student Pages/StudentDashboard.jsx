import React, { useState, useEffect } from "react";
import NoSupervisor from "./Student Components/NoSupervisors";
import SupervisorSelection from "./Student Dashboard Components/SupervisorSelection"

const StudentDashboard = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSupervisor, setHasSupervisor] = useState(false);

  useEffect(() => {
    // Simulating a fetch from your Flask backend
    setTimeout(() => {
      // hasSupervisor = false  → show SupervisorSelection
      // hasSupervisor = true   → show their assigned supervisor info
      setHasSupervisor(false);

      // Replace with real supervisor list from your API
      setSupervisors([
        { id: 1, name: "Mark Antony", email: "mark.antony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "Cloud Computing"], slotsTotal: 7, slotsFilled: 3 },
        { id: 2, name: "Mark Antony", email: "mark.antony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "Data Science"], slotsTotal: 7, slotsFilled: 7 },
        { id: 3, name: "Mark Antony", email: "markantony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "Cybersecurity"], slotsTotal: 7, slotsFilled: 3 },
        { id: 4, name: "Mark Antony", email: "mark.antony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "Networking"], slotsTotal: 7, slotsFilled: 3 },
        { id: 5, name: "Mark Antony", email: "mark.antony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "Machine Learning"], slotsTotal: 7, slotsFilled: 3 },
        { id: 6, name: "Mark Antony", email: "markantony@uonbi.ac.ke", interests: ["Web Development", "Artificial Intelligence", "IoT"], slotsTotal: 7, slotsFilled: 7 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[75vh]">
      <div className="flex-1 flex flex-col">

        {isLoading ? (

          <div className="p-12 text-center text-[#2b20d6] font-bold animate-pulse">
            Loading supervisor data...
          </div>

        ) : hasSupervisor ? (

          // TODO: replace with your assigned supervisor view
          <div className="p-8 text-center text-green-600 font-bold">
            You already have a supervisor assigned.
          </div>

        ) : supervisors.length === 0 ? (

          <div className="flex-1 flex items-center justify-center">
            <NoSupervisor />
          </div>

        ) : (

          <SupervisorSelection supervisors={supervisors} maxPitches={3} />

        )}

      </div>
    </div>
  );
};

export default StudentDashboard;