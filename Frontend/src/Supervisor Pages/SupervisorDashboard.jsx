import React, { useState, useEffect } from "react";
import NoPendingPitches from "./Supervisor Dashboard Components/NoPendingPitches"; 
import PendingPitches from "./Supervisor Dashboard Components/PendingPitches";


const BRAND = "#2b20d6";

const SupervisorDashboard = () => {
  const [pitches, setPitches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating database fetch
    setTimeout(() => {
      // Changed from [] to a mock array so you can SEE the new PendingPitches component!
      // (Change this back to an empty array [] to see the NoPendingPitches state again)
      setPitches([1, 2, 3]); 
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-4 pt-10 pb-16">
      
      {/* Centered Dashboard Title */}
      <h2 
        className="text-3xl md:text-4xl font-extrabold text-center mb-12" 
        style={{ color: BRAND }}
      >
        Dashboard
      </h2>

      {/* Conditional Rendering */}
      {isLoading ? (
          <div className="text-center font-bold animate-pulse mt-12" style={{ color: BRAND }}>
            Loading dashboard...
          </div>
      ) : pitches.length === 0 ? (
          
          <NoPendingPitches />
          
      ) : (
          
          // Replaced the text placeholder with our new interactive component!
          <PendingPitches />
          
      )}

    </div>
  );
};

export default SupervisorDashboard;