import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ImportForm from './ImportForm';
import RecentImports from './RecentImports';
import ImportDetails from './ImportDetails';

const BRAND = "#2b20d6";

export default function DataImport() {
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard' or 'details'
  const [selectedLog, setSelectedLog] = useState(null);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the history of uploads
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Replace with your actual Flask GET route for fetching Upload_log records
      const response = await fetch("http://127.0.0.1:5000/api/admin/upload-logs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setUploadLogs(data.data || []);
      } else {
        toast.error("Failed to load import history.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setActiveView("details");
  };

  const handleBackToDashboard = () => {
    setSelectedLog(null);
    setActiveView("dashboard");
    fetchLogs(); // Refresh logs when coming back
  };

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-[#fbfbfd] border border-blue-200 rounded-[1.5rem] p-6 lg:p-10 flex flex-col shadow-sm">
        
        {activeView === "dashboard" ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10" style={{ color: BRAND }}>
              Data Management
            </h2>
            
            {/* The Upload Form */}
            <ImportForm refreshLogs={fetchLogs} />

            {/* The History Table */}
            <RecentImports 
              logs={uploadLogs} 
              isLoading={isLoading} 
              onViewDetails={handleViewDetails} 
            />
          </>
        ) : (
          <ImportDetails 
            log={selectedLog} 
            onBack={handleBackToDashboard} 
          />
        )}

      </div>
    </div>
  );
}