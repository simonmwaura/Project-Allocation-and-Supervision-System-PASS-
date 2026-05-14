import React from "react";
import PendingPitches from "./Supervisor Dashboard Components/PendingPitches";

const SupervisorDashboard = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <PendingPitches />
    </div>
  );
};

export default SupervisorDashboard;