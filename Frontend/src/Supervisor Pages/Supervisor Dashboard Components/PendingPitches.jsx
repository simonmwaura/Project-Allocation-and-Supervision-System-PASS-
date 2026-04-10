import React, { useState } from "react";
import { FiInfo, FiSearch, FiChevronDown } from "react-icons/fi";
import PitchCard from "./PitchCard";
import PitchReviewDetails from "./PitchReviewDetails"; // <-- Import the new component

const BRAND = "#2b20d6";

// Mock data
const MOCK_PITCHES = [
  { id: 1, name: "Simon Mwaura", reg: "SCS3/148688/2024", project: "Project Allocation and Supervision System" },
  { id: 2, name: "Alice Johnson", reg: "SCS3/148689/2024", project: "AI Driven Crop Disease Detection" },
  { id: 3, name: "Bob Smith", reg: "SCS3/148690/2024", project: "Secure Voting System using Blockchain" },
  { id: 4, name: "Eva Davis", reg: "SCS3/148691/2024", project: "IoT Based Smart Home Automation" },
  { id: 5, name: "David Wilson", reg: "SCS3/148692/2024", project: "Predictive Maintenance in Manufacturing" },
  { id: 6, name: "Grace Lee", reg: "SCS3/148693/2024", project: "Automated Traffic Management System" },
];

const PendingPitches = () => {
  const [activeTab, setActiveTab] = useState("4th");
  const [searchQuery, setSearchQuery] = useState("");
  
  // NEW STATE: Tracks the ID of the pitch currently being reviewed. null means show the grid.
  const [viewingPitchId, setViewingPitchId] = useState(null);

  // Find the full pitch object based on the ID
  const selectedPitchData = MOCK_PITCHES.find(p => p.id === viewingPitchId);

  const handleAcceptPitch = (id) => {
      console.log("Accepted pitch:", id);
      // 1. Send API request to update database
      // 2. Remove from local list (or refetch data)
      // 3. Return to grid
      setViewingPitchId(null);
  };

  const handleDeclinePitch = (id) => {
      console.log("Declined pitch:", id);
      // 1. Send API request to update database
      // 2. Remove from local list
      // 3. Return to grid
      setViewingPitchId(null);
  };

  // If a pitch is selected, show the Details View
  if (viewingPitchId && selectedPitchData) {
      return (
          <PitchReviewDetails 
              pitch={selectedPitchData} 
              onBack={() => setViewingPitchId(null)} 
              onAccept={handleAcceptPitch}
              onDecline={handleDeclinePitch}
          />
      );
  }

  // Otherwise, show the Main Grid View
  return (
    <div className="w-full flex flex-col items-center px-4 pt-8 pb-16">
      
      {/* Title */}
      <h2 
        className="text-2xl md:text-3xl font-bold text-center mb-6" 
        style={{ color: BRAND }}
      >
        Dashboard: Pending Pitches
      </h2>

      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Info Banner */}
        <div 
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm md:text-[15px] font-medium shadow-sm"
          style={{ backgroundColor: BRAND }}
        >
          <FiInfo size={22} className="flex-shrink-0" />
          <p>Review your pending project pitches below. Accept or decline students based on your capacity</p>
        </div>

        {/* Search and Sort Bar */}
        <div 
          className="flex flex-col sm:flex-row items-stretch gap-0 border-[1.5px] rounded-xl bg-white overflow-hidden"
          style={{ borderColor: BRAND }}
        >
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:border-r-[1.5px]" style={{ borderColor: BRAND }}>
            <FiSearch size={20} style={{ color: BRAND }} />
            <input
              type="text"
              placeholder="Search by student name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[15px] text-gray-700 outline-none placeholder-blue-600/60"
            />
          </div>
          
          {/* Sort Dropdown */}
          <button className="flex items-center justify-between sm:justify-center gap-3 px-4 py-3 bg-white text-[15px] font-medium min-w-[200px]" style={{ color: BRAND }}>
            <span>Sort by: Newest First</span>
            <FiChevronDown size={18} />
          </button>
        </div>

        {/* 4th Year / 2nd Year Tabs */}
        <div 
          className="flex w-full border-[1.5px] rounded-full overflow-hidden mt-2"
          style={{ borderColor: BRAND }}
        >
          <button
            onClick={() => setActiveTab("4th")}
            className={`flex-1 py-3 text-[15px] font-bold transition-colors ${
              activeTab === "4th" ? "text-white" : "bg-white hover:bg-blue-50"
            }`}
            style={{ 
              backgroundColor: activeTab === "4th" ? BRAND : "transparent",
              color: activeTab === "4th" ? "#fff" : BRAND
            }}
          >
            4th Year Pitches
          </button>
          <button
            onClick={() => setActiveTab("2nd")}
            className={`flex-1 py-3 text-[15px] font-bold transition-colors ${
              activeTab === "2nd" ? "text-white" : "bg-white hover:bg-blue-50"
            }`}
            style={{ 
              backgroundColor: activeTab === "2nd" ? BRAND : "transparent",
              color: activeTab === "2nd" ? "#fff" : BRAND
            }}
          >
            2nd Year Pitches
          </button>
        </div>

        {/* Capacity Indicator */}
        <p className="text-center font-semibold text-lg mt-2" style={{ color: BRAND }}>
          Capacity: 0 / 7 Accepted
        </p>

        {/* Pitches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {MOCK_PITCHES.map((pitch) => (
            <PitchCard
              key={pitch.id}
              studentName={pitch.name}
              regNumber={pitch.reg}
              projectTitle={pitch.project}
              // Pass the ID to the state when the button is clicked
              onReview={() => setViewingPitchId(pitch.id)} 
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8 font-semibold text-[15px]" style={{ color: BRAND }}>
          <button className="px-2 py-1 hover:underline">&lt;&lt; previous</button>
          <button className="px-2 py-1">1</button>
          <button className="px-2 py-1">2</button>
          <button className="px-2 py-1">3</button>
          <button className="px-2 py-1 hover:underline">next &gt;&gt;</button>
        </div>

      </div>
    </div>
  );
};

export default PendingPitches;