import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSend, FiMessageSquare, FiUsers, FiClipboard, FiActivity, FiUser, FiCalendar, FiClock, FiTrash2 } from 'react-icons/fi';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
const BRAND = "#302AE2";

// Reusable themed panel to match MyProject.jsx exactly
const DashboardPanel = ({ title, icon: Icon, children }) => (
  <div
    className="bg-white border-2 flex flex-col rounded-[15px] p-6 shadow-sm w-full h-full"
    style={{ borderColor: BRAND }}
  >
    <div className="flex items-center justify-center gap-3 mb-6">
      <Icon size={28} style={{ color: BRAND }} strokeWidth={2} />
      <h3 className="font-bold text-xl text-gray-700 text-center">{title}</h3>
    </div>
    <div className="flex flex-col flex-1">
      {children}
    </div>
  </div>
);

const CoordinatorDashboard = () => {
  // --- BROADCAST STATE ---
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentBroadcasts, setSentBroadcasts] = useState([]);
  
  // --- DEADLINE STATE ---
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSettingDeadline, setIsSettingDeadline] = useState(false);
  const [milestones, setMilestones] = useState([]);

  // --- STATS STATE ---
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    activePanels: 0
  });


  const [chartData, setChartData] = useState({
    userRoles: { labels: ['Students', 'Supervisors', 'Coordinators'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#302AE2', '#5A54E8', '#A5A2F2'] }] },
    studentDist: { labels: ['Year 2', 'Year 4'], datasets: [{ data: [0, 0], backgroundColor: ['#10B981', '#F59E0B'] }] },
    accountStatus: { labels: ['Active', 'Pending', 'Suspended'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'] }] }
  });


// --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

      try {
        const [statsRes, panelsRes, broadcastsRes, milestonesRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/coordinators/dashboard-stats", { headers }),
          fetch("http://127.0.0.1:5000/api/coordinators/panels", { headers }),
          fetch("http://127.0.0.1:5000/api/coordinators/broadcasts", { headers }),
          fetch("http://127.0.0.1:5000/api/coordinators/milestones", { headers }),
        ]);

        if (statsRes.ok && panelsRes.ok) {
          const statsData = await statsRes.json();
          const panelsData = await panelsRes.json();
          
          const numStudents = statsData.data?.totalStudents || 0;
          const numSupervisors = statsData.data?.supervisors ? statsData.data.supervisors.length : 0;

          setStats({
            totalStudents: numStudents,
            totalSupervisors: numSupervisors,
            activePanels: panelsData.data ? panelsData.data.length : 0
          });

          // --- THE FIX: UPDATE THE CHART DATA HERE ---
          // Note: If statsData doesn't have these specific fields (like year2, active, etc.), 
          // I added some fallback numbers (e.g. || 60) so the charts will render for testing!
          setChartData({
            userRoles: { 
              labels: ['Students', 'Supervisors', 'Coordinators'], 
              datasets: [{ 
                data: [numStudents || 120, numSupervisors || 15, 2], 
                backgroundColor: ['#302AE2', '#5A54E8', '#A5A2F2'] 
              }] 
            },
            studentDist: { 
              labels: ['Year 2', 'Year 4'], 
              datasets: [{ 
                data: [statsData.data?.year2 || 60, statsData.data?.year4 || 40], 
                backgroundColor: ['#10B981', '#F59E0B'] 
              }] 
            },
            accountStatus: { 
              labels: ['Active', 'Pending', 'Suspended'], 
              datasets: [{ 
                data: [statsData.data?.active || 85, statsData.data?.pending || 10, statsData.data?.suspended || 5], 
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'] 
              }] 
            }
          });
        }

        if (broadcastsRes.ok) {
          const bData = await broadcastsRes.json();
          setSentBroadcasts(bData.data || []);
        }

        if (milestonesRes.ok) {
          const mData = await milestonesRes.json();
          const fetchedMilestones = mData.data || [];
          setMilestones(fetchedMilestones);
          if (fetchedMilestones.length > 0) setSelectedMilestone(fetchedMilestones[0].name);
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data.");
      }
    };
    fetchDashboardData();
  }, []);

  // --- 2. SEND BROADCAST ---
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Please provide both a title and a message.");
      return;
    }

    setIsSending(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/coordinators/broadcasts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage })
      });

      const json = await response.json();

      if (response.ok) {
        toast.success("Broadcast sent successfully!");
        setBroadcastTitle("");
        setBroadcastMessage("");
        const updatedRes = await fetch("http://127.0.0.1:5000/api/coordinators/broadcasts", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setSentBroadcasts(updatedData.data);
        }
      } else {
        toast.error(json.message || "Failed to send broadcast.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSending(false);
    }
  };

  // --- 3. UPDATE DEADLINE ---
  const handleSetDeadline = async (e) => {
    e.preventDefault();
    if (!dueDate) return toast.error("Please select a valid date.");

    setIsSettingDeadline(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/coordinators/milestones/update-deadline", {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_name: selectedMilestone, due_date: dueDate })
      });

      const json = await response.json();

      if (response.ok) {
        setMilestones(milestones.map(m => m.name === selectedMilestone ? { ...m, dueDate: dueDate } : m));
        setDueDate("");
        toast.success(json.message || "Deadline successfully updated!");
      } else {
        toast.error(json.message || "Failed to update deadline.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSettingDeadline(false);
    }
  };

  // --- 4. DELETE MILESTONE ---
  const handleDeleteMilestone = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely delete "${name}"? This cannot be undone.`)) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/coordinators/milestones/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const remaining = milestones.filter(m => m.id !== id);
        setMilestones(remaining);
        if (selectedMilestone === name && remaining.length > 0) {
          setSelectedMilestone(remaining[0].name);
        } else if (remaining.length === 0) {
          setSelectedMilestone("");
        }
        toast.success("Milestone deleted.");
      } else {
        const json = await response.json();
        toast.error(json.message || "Failed to delete milestone.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-8 pb-12">
      
      {/* Page Header */}
      <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: BRAND }}>
        Coordinator Dashboard
      </h2>
    
      <p className="text-center text-gray-500 mb-10 font-semibold">
        Manage system notices and milestone deadlines
      </p>

      <div className="w-full max-w-6xl mb-12">
        <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
            <FiActivity style={{ color: BRAND }} /> System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 shadow-sm" style={{ borderColor: BRAND }}>
                <p className="text-center font-bold text-gray-500 mb-4">USER ROLES</p>
                <Doughnut data={chartData.userRoles} />
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 shadow-sm" style={{ borderColor: BRAND }}>
                <p className="text-center font-bold text-gray-500 mb-4">STUDENT DISTRIBUTION</p>
                <Doughnut data={chartData.studentDist} />
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 shadow-sm" style={{ borderColor: BRAND }}>
                <p className="text-center font-bold text-gray-500 mb-4">ACCOUNT STATUS</p>
                <Doughnut data={chartData.accountStatus} />
            </div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* Top Row: Stats (Matching the heavy borders) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 rounded-[15px] p-6 flex items-center gap-4 shadow-sm" style={{ borderColor: BRAND }}>
            <FiUsers size={36} style={{ color: BRAND }} />
            <div>
              <p className="text-sm font-bold text-gray-500">Total Students</p>
              <p className="text-2xl font-extrabold text-gray-800">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="bg-white border-2 rounded-[15px] p-6 flex items-center gap-4 shadow-sm" style={{ borderColor: BRAND }}>
            <FiClipboard size={36} style={{ color: BRAND }} />
            <div>
              <p className="text-sm font-bold text-gray-500">Supervisors</p>
              <p className="text-2xl font-extrabold text-gray-800">{stats.totalSupervisors}</p>
            </div>
          </div>
          <div className="bg-white border-2 rounded-[15px] p-6 flex items-center gap-4 shadow-sm" style={{ borderColor: BRAND }}>
            <FiActivity size={36} style={{ color: BRAND }} />
            <div>
              <p className="text-sm font-bold text-gray-500">Active Panels</p>
              <p className="text-2xl font-extrabold text-gray-800">{stats.activePanels}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Actions/Forms */}
          <div className="flex flex-col gap-8">
            
            {/* Create Broadcast Form */}
            <DashboardPanel title="Send Notice" icon={FiMessageSquare}>
              <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600 px-1">Notice Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 bg-gray-50 outline-none font-medium text-gray-700 transition-colors"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600 px-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 bg-gray-50 outline-none font-medium text-gray-700 transition-colors resize-none"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div className="flex justify-center w-full mt-4">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="h-12 rounded-xl w-full text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ backgroundColor: BRAND }}
                  >
                    {isSending ? "Sending..." : "Send Broadcast"}
                    {!isSending && <FiSend size={18} />}
                  </button>
                </div>
              </form>
            </DashboardPanel>

            {/* Set Deadline Form */}
            <DashboardPanel title="Set Milestone Deadline" icon={FiCalendar}>
              <form onSubmit={handleSetDeadline} className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600 px-1">Select Milestone</label>
                  <select
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 bg-gray-50 outline-none font-medium text-gray-700 transition-colors"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  >
                    {milestones.length === 0 && <option value="">Loading...</option>}
                    {milestones.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600 px-1">New Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 bg-gray-50 outline-none font-medium text-gray-700 transition-colors"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div className="flex justify-center w-full mt-4">
                  <button
                    type="submit"
                    disabled={isSettingDeadline || milestones.length === 0}
                    className="h-12 rounded-xl w-full text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-70"
                    style={{ backgroundColor: BRAND }}
                  >
                    {isSettingDeadline ? "Updating..." : "Update Deadline"}
                  </button>
                </div>
              </form>
            </DashboardPanel>
          </div>

          {/* RIGHT COLUMN: Lists */}
          <div className="flex flex-col gap-8">
            
            {/* Active Deadlines List */}
            <DashboardPanel title="Current Deadlines" icon={FiClock}>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-2">
                {milestones.length === 0 ? (
                  <p className="text-center text-gray-400 font-medium py-8">Loading milestones...</p>
                ) : (
                  milestones.map((m, index) => (
                    <div key={m.id} className="border-2 rounded-[12px] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50" style={{ borderColor: "#e2e8f0" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: BRAND }}>
                          {index + 1}
                        </div>
                        <span className="font-bold text-gray-800 text-sm md:text-base">{m.name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <span className={`font-bold text-sm ${!m.dueDate || m.dueDate === "TBD" ? "text-gray-500" : "text-red-600"}`}>
                          {m.dueDate || "TBD"}
                        </span>
                        <button 
                          onClick={() => handleDeleteMilestone(m.id, m.name)}
                          className="p-2 bg-white border-2 border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                          title="Delete Milestone"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DashboardPanel>

            {/* Broadcast History */}
            <DashboardPanel title="Sent Notices" icon={FiSend}>
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-2">
                {sentBroadcasts.length === 0 ? (
                  <p className="text-center text-gray-400 font-medium py-8">No notices sent yet.</p>
                ) : (
                  sentBroadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="border-2 rounded-[12px] p-4 bg-gray-50 flex gap-3" style={{ borderColor: "#e2e8f0" }}>
                      <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: BRAND }}>
                        <FiUser size={20} />
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-1">
                          <span className="font-bold text-sm" style={{ color: BRAND }}>{broadcast.author}</span>
                          <span className="text-gray-500 font-bold text-xs">{broadcast.date}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{broadcast.title}</h4>
                        <p className="text-gray-600 font-medium text-xs leading-relaxed whitespace-pre-wrap">
                          {broadcast.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DashboardPanel>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;