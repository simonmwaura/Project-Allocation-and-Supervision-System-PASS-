import React, { useState, useEffect } from "react";
import { FiFileText, FiUploadCloud, FiClock, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NoActiveProject from "./Student MyProject Components/NoActiveProject "

const DashboardCard = ({ title, description, icon: Icon, buttonText, onClick }) => {
  return (
    <div
      className="bg-white border-2 flex flex-col items-center rounded-[15px] p-6 shadow-sm w-full h-full"
      style={{ borderColor: "#302AE2" }}
    >
      <h3 className="font-bold text-xl text-gray-700 mt-2 text-center">
        {title}
      </h3>

      <div className="flex justify-center mt-6 mb-4" style={{ color: "#475569" }}>
        <Icon size={72} strokeWidth={1.5} />
      </div>

      <p className="font-medium text-sm text-gray-500 px-2 text-center flex-1">
        {description}
      </p>

      <div className="flex justify-center w-full mt-6">
        <button
          onClick={onClick}
          className="h-12 rounded-xl w-[90%] text-white font-bold text-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#302AE2" }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const MyProject = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProject({ id: 1, title: "Project Allocation System" });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-4 pt-8 pb-12">

      {isLoading ? (
        <div className="text-xl font-bold animate-pulse mt-20" style={{ color: "#302AE2" }}>
          Loading project workspace...
        </div>
      ) : !project ? (
        <NoActiveProject />
      ) : (
        <div className="w-full max-w-4xl">

          <h2
            className="text-3xl font-bold mb-10 text-center"
            style={{ color: "#302AE2" }}
          >
            My Project Workspace
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">

            <DashboardCard
              title="Project Details"
              icon={FiFileText}
              description="View your approved project title, supervisor information, and track your current progress across the semester milestones."
              buttonText="View Details"
              onClick={() => navigate("/student/project-details")}
            />

            <DashboardCard
              title="Upload Documents"
              icon={FiUploadCloud}
              description="Submit your required .PDF or .DOCX milestone documents for your supervisor to review."
              buttonText="Upload Now"
              onClick={() => navigate("/student/upload-document")}
            />

            <DashboardCard
              title="Submission History"
              icon={FiClock}
              description="Access your previously uploaded documents, download files, and check the review status of your submissions."
              buttonText="View History"
              onClick={() => navigate("/student/submission-history")}
            />

            <DashboardCard
              title="Coordinator Notices"
              icon={FiBell}
              description="Read the latest milestone requirements, formatting rules, and official announcements from the Project Coordinator."
              buttonText="View Notices"
              onClick={() => navigate("/student/coordinator-notices")}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default MyProject;