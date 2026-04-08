import React, { useState } from "react";

const BRAND = "#302AE2";

// A comprehensive list of tech/research areas
const TECH_AREAS = [
  "Machine Learning",
  "Mobile App Development",
  "Computer Vision",
  "Networking",
  "Web Development",
  "Cloud Computing",
  "Software Engineering",
  "Embedded Systems",
  "Cybersecurity",
  "Internet of Things (IoT)",
  "Natural Language Processing",
  "Artificial Intelligence",
  "Data Science",
  "Game Development",
  "Blockchain Technology",
  "Database Management",
];

const SupervisorInterestsSetup = ({ supervisorName = "Mark Antony", onComplete }) => {
  // FIX: Start with an empty array so no buttons are pre-selected
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (area) => {
    if (selectedInterests.includes(area)) {
      // If it's already selected, remove it
      setSelectedInterests(selectedInterests.filter((item) => item !== area));
    } else {
      // If it's not selected, add it
      setSelectedInterests([...selectedInterests, area]);
    }
  };

  const handleConfirm = () => {
    // Here you would typically make an API call to save to Flask
    console.log("Saving interests to database:", selectedInterests);
    
    // Trigger the callback to move the user to the main dashboard
    if (onComplete) {
      onComplete(selectedInterests);
    }
  };

  return (
    // Full screen background to hide anything else
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      
      {/* Outer container with the thin blue border */}
      <div 
        className="w-full max-w-6xl border rounded-[2rem] p-4 md:p-12 flex items-center justify-center min-h-[85vh] bg-transparent"
        style={{ borderColor: BRAND }}
      >
        
        {/* Inner white card with shadow */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-4xl p-8 md:p-14 flex flex-col items-center">
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-center" style={{ color: BRAND }}>
            Welcome {supervisorName}
          </h1>
          
          <p className="text-gray-500 font-medium mb-12 text-center text-[15px] md:text-base px-2">
            To help students find the right mentor, please select your primary areas of research interest.
          </p>

          {/* Grid of Interest Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full mb-12">
            {TECH_AREAS.map((area) => {
              const isSelected = selectedInterests.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleInterest(area)}
                  className={`px-2 py-3 rounded-xl font-bold text-[12px] md:text-[13px] transition-all duration-200 
                    ${isSelected 
                      ? 'text-white shadow-inner scale-95' // Pressed down effect when selected
                      : 'text-white bg-gray-500 hover:bg-gray-600 shadow-md hover:-translate-y-0.5' // Raised effect when unselected
                    }
                  `}
                  style={isSelected ? { backgroundColor: BRAND } : {}}
                >
                  {area}
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={selectedInterests.length === 0}
            className="px-10 py-3.5 rounded-xl text-white font-bold text-base transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND }}
          >
            Confirm Areas of Interest
          </button>

        </div>
      </div>
    </div>
  );
};

export default SupervisorInterestsSetup;