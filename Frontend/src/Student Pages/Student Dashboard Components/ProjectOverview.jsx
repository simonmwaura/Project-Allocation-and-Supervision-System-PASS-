import React, { useState } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BRAND = "#302AE2";

const ProjectOverview = () => {
  const navigate = useNavigate();
  // State to handle hiding the success banner when the 'x' is clicked
  const [showBanner, setShowBanner] = useState(true);

  // Mock data that would normally come from your database
  const project = {
    title: "Smart Highway Enforcement System",
    supervisor: "Mark Antony",
    status: "Active",
    deadlineTask: "Submit Milestone 1 Proposal & PowerPoint Slides",
    deadlineDue: "March 15th, 2026 at 11:59pm"
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pt-4 pb-12 px-4">
      
      {/* Page Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: BRAND }}>
        Dashboard: Project Overview
      </h2>

      {/* Success Banner */}
      {showBanner && (
        <div className="flex items-center justify-between bg-[#ecfdf5] border border-[#34d399] rounded-full px-5 py-3 shadow-sm transition-all">
          <div className="flex items-center gap-3 text-[#059669]">
            <FiCheckCircle size={20} strokeWidth={2.5} />
            <span className="text-sm font-semibold">
              Pitch Approved: You are now officially supervised by {project.supervisor}.
            </span>
          </div>
          <button 
            onClick={() => setShowBanner(false)} 
            className="text-[#059669] hover:opacity-70 transition-opacity"
          >
            <FiX size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        {/* Card 1: Project Details */}
        <div className="bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col h-full" style={{ borderColor: BRAND }}>
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: BRAND }}>Project Details</h3>
          
          <div className="flex flex-col gap-3 text-[15px] flex-1">
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Title : </span> 
              <span className="text-gray-500 font-medium">{project.title}</span>
            </p>
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Supervisor : </span> 
              <span className="text-gray-500 font-medium">{project.supervisor}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-bold" style={{ color: BRAND }}>Status : </span>
              <span className="bg-[#10b981] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {project.status}
              </span>
            </p>
          </div>
          
          <button className="w-full mt-8 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-colors shadow-sm" style={{ backgroundColor: BRAND }}>
            View all project details
          </button>
        </div>

        {/* Card 2: Upcoming Deadline */}
        <div className="bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col h-full" style={{ borderColor: BRAND }}>
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: BRAND }}>Upcoming Deadline</h3>
          
          <div className="flex flex-col gap-3 text-[15px] flex-1">
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Task : </span> 
              <span className="text-gray-500 font-medium">{project.deadlineTask}</span>
            </p>
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Due : </span> 
              <span className="text-red-600 font-semibold">{project.deadlineDue}</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/student/upload-document")} 
            className="w-full mt-8 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-colors shadow-sm" 
            style={{ backgroundColor: BRAND }}
          >
            Upload Documents
          </button>
        </div>

      </div>

      {/* Bottom Card: Milestones */}
      <div className="bg-white border-2 rounded-2xl p-8 shadow-sm flex flex-col mt-2" style={{ borderColor: BRAND }}>
        <h3 className="text-xl font-bold text-center mb-16" style={{ color: BRAND }}>Project Milestones</h3>

        {/* Timeline Container */}
        <div className="relative w-full max-w-3xl mx-auto flex justify-between items-center px-4 md:px-12 mb-4">
          
          {/* Background Grey Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
          
          {/* Node 1 (Active) */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold border-[6px] border-white outline outline-2 outline-white shadow-md" 
              style={{ backgroundColor: BRAND }}
            >
              1
            </div>
            <div className="absolute top-20 w-40 text-center flex flex-col gap-1">
              <span className="font-bold text-[15px]" style={{ color: BRAND }}>Milestone 1</span>
              <span className="text-[13px] font-semibold" style={{ color: BRAND }}>Project Proposal</span>
            </div>
          </div>

          {/* Node 2 (Inactive) */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-transparent border-[6px] border-white outline outline-2 outline-white bg-gray-300 shadow-md">
              2
            </div>
            <div className="absolute top-20 w-48 text-center flex flex-col gap-1 text-gray-400">
              <span className="font-bold text-[15px]">Milestone 2</span>
              <span className="text-[13px] font-medium">Project Progress Report</span>
            </div>
          </div>

          {/* Node 3 (Inactive) */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-transparent border-[6px] border-white outline outline-2 outline-white bg-gray-300 shadow-md">
              3
            </div>
            <div className="absolute top-20 w-40 text-center flex flex-col gap-1 text-gray-400">
              <span className="font-bold text-[15px]">Milestone 3</span>
              <span className="text-[13px] font-medium">Final Project Report</span>
            </div>
          </div>
        </div>

        {/* Padding to account for the absolute positioned text labels below the circles */}
        <div className="h-16"></div>
      </div>

    </div>
  );
};

export default ProjectOverview;