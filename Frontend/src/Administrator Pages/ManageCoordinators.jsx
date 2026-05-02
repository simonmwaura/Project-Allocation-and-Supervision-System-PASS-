import React, { useState, useEffect } from "react";
import { FiUser, FiArrowLeft, FiChevronDown, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

export default function ManageCoordinators({ availableFaculty = [] }) {
  const [selectedYear, setSelectedYear] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedNewCoordinator, setSelectedNewCoordinator] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  // States for live database data
  const [coordinators, setCoordinators] = useState({ 2: null, 4: null });
  const [history, setHistory] = useState([]);

  // --- 1. FETCH LIVE DATA ON LOAD ---
  const fetchCoordinatorData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // Fetch both current coordinators and history simultaneously
      const [coordRes, histRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/coordinators/", { headers }), 
        fetch("http://127.0.0.1:5000/api/coordinators/history", { headers })
      ]);

      if (coordRes.ok && histRes.ok) {
        const coordData = await coordRes.json();
        const histData = await histRes.json();
        
        setCoordinators(coordData.data || { 2: null, 4: null });
        setHistory(histData.data || []);
      } else {
        toast.error("Failed to fetch coordinator data from server.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Network error: Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  // --- HANDLERS ---
  const handleReassignClick = (year) => {
    setSelectedYear(year);
    setSelectedNewCoordinator("");
    setReassignReason("");
  };

  // --- 2. SEND LIVE DATA TO BACKEND ---
  const handleConfirmReassignment = async () => {
    if (!selectedNewCoordinator || !reassignReason) {
      toast.warning("Please select a new coordinator and provide a reason.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/api/coordinators/reassign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          year: selectedYear,
          new_coordinator_id: selectedNewCoordinator,
          reason: reassignReason
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully reassigned the Year ${selectedYear} Coordinator.`);
        setSelectedYear(null); 
        fetchCoordinatorData(); // Refresh the dashboard instantly!
      } else {
        toast.error(data.message || "Failed to reassign coordinator.");
      }
    } catch (error) {
      toast.error("Network error: Could not reassign coordinator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center font-bold text-gray-500 animate-pulse">
        <FiLoader size={30} className="animate-spin mb-4" style={{ color: BRAND }} />
        Loading Coordinator Data...
      </div>
    );
  }

  // ==========================================
  // VIEW 2: REASSIGN COORDINATOR DETAILS
  // ==========================================
  if (selectedYear) {
    const currentCoordinator = coordinators[selectedYear] || {};

    return (
      <div className="w-full h-full flex flex-col items-center">
        <div className="w-full max-w-4xl bg-[#fbfbfd] border border-blue-200 rounded-[1.5rem] p-6 lg:p-10 flex flex-col shadow-sm relative">
          
          <button
            onClick={() => setSelectedYear(null)}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BRAND }}
          >
            <FiArrowLeft size={18} strokeWidth={3} />
            Back to coordinators
          </button>

          <h2 className="text-xl sm:text-2xl font-extrabold text-center mb-10 mt-12 sm:mt-0" style={{ color: BRAND }}>
            {selectedYear}th Year Coordinator Details
          </h2>

          <div className="flex flex-col items-center w-full gap-8">
            <div className="w-full max-w-md bg-white border rounded-2xl p-6 flex flex-col items-center shadow-sm" style={{ borderColor: BRAND }}>
              <h3 className="font-extrabold text-gray-900 mb-4 text-[15px]">Current Coordinator</h3>
              <div className="w-20 h-20 rounded-full border-4 shadow-sm flex items-center justify-center mb-3" style={{ borderColor: BRAND, backgroundColor: BRAND }}>
                <FiUser size={40} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-700">{currentCoordinator.name || "Not Assigned"}</h4>
              <p className="text-sm font-medium" style={{ color: BRAND }}>{currentCoordinator.email || "---"}</p>
            </div>

            <div className="w-full max-w-lg bg-white border rounded-2xl p-6 lg:p-8 flex flex-col shadow-sm" style={{ borderColor: BRAND }}>
              <h3 className="font-extrabold text-center mb-6 text-[16px]" style={{ color: BRAND }}>Reassign Coordinator</h3>
              
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 ml-1 block">Select New Coordinator</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-3.5 text-gray-400 z-10" size={18} />
                    <select 
  value={selectedNewCoordinator}
  onChange={(e) => setSelectedNewCoordinator(e.target.value)}
  className="w-full bg-[#f8f9fa] border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium appearance-none cursor-pointer"
>
  <option value="" disabled>Select New Coordinator</option>
  
  {/* --- THE FIX: Filter out Suspended and Pending accounts before showing them --- */}
  {availableFaculty
    .filter(faculty => faculty.status === 'Active') // <-- THIS LINE IS THE MAGIC
    .map(faculty => (
      <option key={faculty.id} value={faculty.id}>
        {faculty.name}
      </option>
  ))}

</select>
                    <FiChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 ml-1 block">Reason for reassignment</label>
                  <textarea 
                    rows="4"
                    placeholder="Reason for Reassignment"
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-gray-200 text-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-center mt-2">
                  <button 
                    onClick={handleConfirmReassignment}
                    disabled={isSubmitting}
                    className="w-full max-w-[250px] py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:bg-blue-300"
                    style={{ backgroundColor: BRAND }}
                  >
                    {isSubmitting ? "Processing..." : "Confirm Reassignment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: DASHBOARD
  // ==========================================
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-5xl bg-[#fbfbfd] border border-blue-200 rounded-[1.5rem] p-6 lg:p-10 flex flex-col shadow-sm">
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10" style={{ color: BRAND }}>
          Coordinator Account Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 w-full mb-12">
          {/* 2nd Year Card */}
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: BRAND }}>
            <h3 className="font-extrabold text-gray-900 mb-6 text-lg">2nd Year Coordinator</h3>
            <div className="w-24 h-24 rounded-full border-4 shadow-sm flex items-center justify-center mb-4" style={{ borderColor: BRAND, backgroundColor: BRAND }}>
              <FiUser size={50} className="text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-600 mb-1">{coordinators[2]?.name || "Not Assigned"}</h4>
            <p className="text-sm font-bold mb-6" style={{ color: BRAND }}>{coordinators[2]?.email || "---"}</p>
            <button 
              onClick={() => handleReassignClick(2)}
              className="w-full max-w-[220px] py-2.5 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: BRAND }}
            >
              Reassign Role
            </button>
          </div>

          {/* 4th Year Card */}
          <div className="bg-white border rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: BRAND }}>
            <h3 className="font-extrabold text-gray-900 mb-6 text-lg">4th Year Coordinator</h3>
            <div className="w-24 h-24 rounded-full border-4 shadow-sm flex items-center justify-center mb-4" style={{ borderColor: BRAND, backgroundColor: BRAND }}>
              <FiUser size={50} className="text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-600 mb-1">{coordinators[4]?.name || "Not Assigned"}</h4>
            <p className="text-sm font-bold mb-6" style={{ color: BRAND }}>{coordinators[4]?.email || "---"}</p>
            <button 
              onClick={() => handleReassignClick(4)}
              className="w-full max-w-[220px] py-2.5 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: BRAND }}
            >
              Reassign Role
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg font-extrabold mb-4" style={{ color: BRAND }}>Reassignment History</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border-[1.5px] min-w-[700px] bg-white" style={{ borderColor: BRAND }}>
              <thead>
                <tr>
                  {["#", "Date", "Year", "Previous Coordinator", "Current Coordinator", "Reasons for change"].map((header) => (
                    <th key={header} className="border-[1.5px] p-3 text-[14px] font-extrabold text-left bg-[#fbfbfd]" style={{ borderColor: BRAND, color: BRAND }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((record, index) => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="border-[1.5px] p-3 font-bold text-gray-800 text-[14px]" style={{ borderColor: BRAND }}>{index + 1}</td>
                    <td className="border-[1.5px] p-3 font-bold text-gray-900 text-[14px]" style={{ borderColor: BRAND }}>{record.date}</td>
                    <td className="border-[1.5px] p-3 font-bold text-gray-900 text-[14px] text-center" style={{ borderColor: BRAND }}>{record.year}</td>
                    <td className="border-[1.5px] p-3 font-bold text-gray-800 text-[14px]" style={{ borderColor: BRAND }}>{record.prev}</td>
                    <td className="border-[1.5px] p-3 font-bold text-gray-800 text-[14px]" style={{ borderColor: BRAND }}>{record.curr}</td>
                    <td className="border-[1.5px] p-3 font-medium text-gray-700 text-[13px]" style={{ borderColor: BRAND }}>{record.reason}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center font-bold text-gray-400">No reassignment history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}