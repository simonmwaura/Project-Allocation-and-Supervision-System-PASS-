import React, { useState,useEffect } from 'react';
import { FiUsers, FiDatabase, FiAlertOctagon, FiTrash2, FiX, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const BRAND = "#2b20d6";

// --- STRICT CONFIRMATION MODAL ---
const DangerModal = ({ isOpen, onClose, onConfirm, targetName, isProcessing }) => {
  const [typedConfirm, setTypedConfirm] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (typedConfirm === "CONFIRM") {
      onConfirm();
      setTypedConfirm(""); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl relative border-t-8 border-red-600">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <FiX size={24} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <FiAlertOctagon size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Destructive Action</h2>
          <p className="text-sm text-gray-600 font-medium">
            You are about to permanently wipe <strong className="text-red-600">{targetName}</strong> from the database. This action cannot be undone.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 mb-2 block text-center">
            Type <span className="text-red-600 font-black">CONFIRM</span> below to proceed:
          </label>
          <input
            type="text"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            placeholder="CONFIRM"
            className="w-full bg-gray-50 border-2 border-red-200 text-red-700 text-center rounded-xl py-3 font-black tracking-widest focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={typedConfirm !== "CONFIRM" || isProcessing}
            className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isProcessing ? "Wiping..." : "Execute Wipe"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function AdministratorDashboard() {
  const [modalState, setModalState] = useState({ isOpen: false, target: '', targetName: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for live chart data
  const [stats, setStats] = useState({ roles: [0, 0, 0], years: [0, 0], status: [0, 0, 0] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:5000/api/users/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === 'success') setStats(json.data);
      } catch (err) { console.error("Stats fetch failed"); }
    };
    fetchStats();
  }, []);

  // Update your data objects to use 'stats'
  const roleChartData = {
    labels: ['Students', 'Supervisors', 'Coordinators'],
    datasets: [{ data: stats.roles, backgroundColor: ['#2b20d6', '#5c54e5', '#8f88f0'] }]
  };

  const yearChartData = {
    labels: ['Year 2', 'Year 4'],
    datasets: [{ data: stats.years, backgroundColor: ['#00C49F', '#FFBB28'] }]
  };

  const statusChartData = {
    labels: ['Active', 'Pending', 'Suspended'],
    datasets: [{ data: stats.status, backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { weight: 'bold' },
          padding: 15
        }
      }
    }
  };

  const openModal = (target, targetName) => {
    setModalState({ isOpen: true, target, targetName });
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/system-reset", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target: modalState.target }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to execute system reset.");
      }
    } catch (error) {
      toast.error("Network error. Could not connect to server.");
    } finally {
      setIsProcessing(false);
      setModalState({ isOpen: false, target: '', targetName: '' });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-10 px-4 md:px-8 pt-8">
      
      <DangerModal
        isOpen={modalState.isOpen}
        onClose={() => !isProcessing && setModalState({ isOpen: false, target: '', targetName: '' })}
        onConfirm={handleReset}
        targetName={modalState.targetName}
        isProcessing={isProcessing}
      />

      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: BRAND }}>
          System Administration
        </h1>
        <p className="text-gray-500 font-medium mb-8">
          Monitor system analytics and manage bulk data operations.
        </p>

        {/* --- SYSTEM ANALYTICS CHARTS --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiActivity size={24} className="text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Chart 1: User Roles */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">User Roles</h3>
              <div className="w-full h-64 relative">
                <Pie data={roleChartData} options={chartOptions} />
              </div>
            </div>

            {/* Chart 2: Student Demographics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Student Distribution</h3>
              <div className="w-full h-64 relative">
                <Pie data={yearChartData} options={chartOptions} />
              </div>
            </div>

            {/* Chart 3: Account Statuses */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center md:col-span-2 xl:col-span-1">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Account Status</h3>
              <div className="w-full h-64 relative">
                <Pie data={statusChartData} options={chartOptions} />
              </div>
            </div>

          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div className="bg-[#fffdfd] border-2 border-red-500 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FiAlertOctagon size={28} className="text-red-600" />
            <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>
          </div>
          
          <p className="text-gray-600 font-medium mb-8">
            The actions below will permanently delete entire groups of users from the PostgreSQL database. Use these tools only when preparing for a new academic year or recovering from a corrupted CSV upload. <strong>Your Master Admin account will not be deleted.</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* WIPE STUDENTS */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <FiUsers size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Students</h3>
              <p className="text-xs text-gray-500 font-medium mb-6 flex-1">
                Removes all 2nd and 4th-year students and their submissions from the system.
              </p>
              <button 
                onClick={() => openModal('students', 'ALL STUDENT RECORDS')}
                className="w-full py-2.5 rounded-lg font-bold text-red-600 border-2 border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 size={16} /> Wipe Students
              </button>
            </div>

            {/* WIPE FACULTY */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <FiUsers size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Faculty</h3>
              <p className="text-xs text-gray-500 font-medium mb-6 flex-1">
                Removes all Supervisors, Coordinators, and their allocated project pools.
              </p>
              <button 
                onClick={() => openModal('faculty', 'ALL FACULTY RECORDS')}
                className="w-full py-2.5 rounded-lg font-bold text-red-600 border-2 border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 size={16} /> Wipe Faculty
              </button>
            </div>

            {/* FACTORY RESET */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <FiDatabase size={24} />
              </div>
              <h3 className="text-lg font-bold text-red-700 mb-2">Factory Reset</h3>
              <p className="text-xs text-red-600 font-medium mb-6 flex-1">
                Total system wipe. Erases all users except the Master Administrator.
              </p>
              <button 
                onClick={() => openModal('all', 'THE ENTIRE DATABASE')}
                className="w-full py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <FiTrash2 size={16} /> Factory Reset
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}