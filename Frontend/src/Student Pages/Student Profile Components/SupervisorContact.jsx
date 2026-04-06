import React from 'react';

const SupervisorContact = ({ supervisorData }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border-2 flex flex-col space-y-5" style={{ borderColor: "#302AE2" }}>
      <h3 className="text-xl font-bold" style={{ color: "#302AE2" }}>My Supervisor</h3>
      
      <div className="flex flex-col space-y-4 text-sm w-full">
        
        {/* CLOSER SPACING: Using gap-3 and w-16 to match StudentCard */}
        <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-500 w-16 shrink-0">Name:</span> 
            <span className="font-bold text-gray-800 text-base">{supervisorData.name}</span>
        </div>
        
        {/* CLOSER SPACING: Using gap-3 and w-16 to match StudentCard */}
        <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-semibold text-gray-500 w-16 shrink-0">Email:</span> 
            <span className="font-medium truncate" style={{ color: "#302AE2" }} title={supervisorData.email}>
              {supervisorData.email}
            </span>
        </div>

      </div>
    </div>
  );
};

export default SupervisorContact;