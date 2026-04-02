import React, { useState, useEffect } from "react";
import NoActiveProject from "./Student Components/NoActiveProject "; // Adjust path if needed

const MyProject = () => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProject(null); 
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    // FIX: w-full h-full min-h-[80vh] with flex items-center justify-center
    // This guarantees whatever is inside sits perfectly in the middle of the screen
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center">
        
        {isLoading ? (
          <div className="text-[#2b20d6] text-xl font-bold animate-pulse">
            Loading project data...
          </div>
        ) : !project ? (
          <NoActiveProject />
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-[#2b20d6] shadow-sm">
            <h2 className="text-2xl font-bold text-[#2b20d6] mb-4">
              {project.title}
            </h2>
            <p className="text-gray-700">Project details go here.</p>
          </div>
        )}
        
    </div>
  );
};

export default MyProject;