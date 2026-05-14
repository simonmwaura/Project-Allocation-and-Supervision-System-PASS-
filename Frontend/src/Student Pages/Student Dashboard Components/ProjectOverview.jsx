import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const ProjectOverview = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        // Fetch both in parallel
        const [overviewRes, milestonesRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/students/project-overview", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:5000/api/students/milestones", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const overviewData = await overviewRes.json();
        const milestonesData = await milestonesRes.json();

        if (overviewRes.ok) {
          setProjectData(overviewData.data);
        } else {
          toast.error(overviewData.message || "Could not load project details.");
        }

        if (milestonesRes.ok) {
          setMilestones(milestonesData.data || []);
        }
      } catch (error) {
        toast.error("Network error. Could not connect to server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center pt-20">
        <div className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>
          Loading your project details...
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="w-full max-w-5xl mx-auto pt-12 text-center text-gray-600 font-medium">
        You do not have an active project yet. Please go to the dashboard to pitch a supervisor.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pt-4 pb-12 px-4 relative z-0">

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
              Pitch Approved: You are now officially supervised by {projectData.supervisor}.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 relative z-10">

        {/* Card 1: Project Details */}
        <div className="bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col h-full" style={{ borderColor: BRAND }}>
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: BRAND }}>Project Details</h3>

          <div className="flex flex-col gap-3 text-[15px] flex-1">
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Title : </span>
              <span className="text-gray-500 font-medium">{projectData.title}</span>
            </p>
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Supervisor : </span>
              <span className="text-gray-500 font-medium">{projectData.supervisor}</span>
            </p>
            <p className="flex items-center gap-2 mt-1">
              <span className="font-bold" style={{ color: BRAND }}>Status : </span>
              <span className="bg-[#10b981] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {projectData.status}
              </span>
            </p>
          </div>

          <button
  onClick={() => navigate("/student/myproject")} // <-- ADD THIS LINE
  className="w-full mt-8 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-colors shadow-sm"
  style={{ backgroundColor: BRAND }}
>
  View all project details
</button>
        </div>

        {/* Card 2: Upcoming Deadline */}
        <div className="bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col h-full" style={{ borderColor: BRAND }}>
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: BRAND }}>Upcoming Deadline</h3>

          <div className="flex flex-col gap-3 text-[15px] flex-1">
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Task : </span>
              <span className="text-gray-500 font-medium">{projectData.deadlineTask}</span>
            </p>
            <p>
              <span className="font-bold" style={{ color: BRAND }}>Due : </span>
              <span className="text-red-600 font-semibold">{projectData.deadlineDue}</span>
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

      {/* Bottom Card: Milestones — dynamic based on student year */}
      <div
        className="bg-white border-2 rounded-2xl p-8 shadow-sm flex flex-col mt-2 relative z-10"
        style={{ borderColor: BRAND }}
      >
        <h3 className="text-xl font-bold text-center mb-16" style={{ color: BRAND }}>
          Project Milestones
        </h3>

        {milestones.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No milestones found.</p>
        ) : (
          <div className="relative w-full max-w-3xl mx-auto flex justify-between items-center px-4 md:px-12 mb-4">

            {/* Background grey line — spans between first and last node */}
            <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />

            {milestones.map((m, index) => {
              const isActive = index === 0;
              // Strip the "Milestone N - " prefix so labels are short and clean
              const shortName = m.milestone_name.replace(/^Milestone \d+ - /, "");

              return (
                <div key={m.milestone_id} className="flex flex-col items-center relative z-10">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-[6px] border-white outline outline-2 outline-white shadow-md"
                    style={{
                      backgroundColor: isActive ? BRAND : "#d1d5db",
                      color: isActive ? "white" : "transparent",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    className={`absolute top-20 w-40 text-center flex flex-col gap-1 ${
                      isActive ? "" : "text-gray-400"
                    }`}
                  >
                    <span
                      className="font-bold text-[15px]"
                      style={isActive ? { color: BRAND } : {}}
                    >
                      Milestone {index + 1}
                    </span>
                    <span className="text-[13px] font-medium">{shortName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Spacer for the absolute-positioned labels below the circles */}
        <div className="h-16" />
      </div>
    </div>
  );
};

export default ProjectOverview;