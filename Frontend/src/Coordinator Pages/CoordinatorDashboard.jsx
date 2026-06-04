import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSend, FiMessageSquare, FiUsers, FiClipboard, FiActivity, FiUser } from 'react-icons/fi';

const BRAND = "#2b20d6";

const CoordinatorDashboard = () => {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Mock data for dashboard stats
  const [stats, setStats] = useState({
    totalStudents: 142,
    totalSupervisors: 28,
    activePanels: 6
  });

  // Mock history of sent broadcasts
  const [sentBroadcasts, setSentBroadcasts] = useState([
    {
      id: 1,
      title: "URGENT: Milestone 1 Formatting Requirements",
      message: "Hello all, Please ensure your Milestone 1 proposals are submitted strictly in PDF format. Do not upload raw code files to the repository at this stage. Any submissions not in PDF format will be returned unread. Regards, Dr. Almaz",
      date: "Mar 4",
      author: "Dr. Simon - Project Coordinator"
    }
  ]);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Please provide both a title and a message.");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API Call
      // const token = localStorage.getItem("token");
      // await fetch("http://127.0.0.1:5000/api/coordinators/broadcasts", { ... })
      
      setTimeout(() => {
        const newBroadcast = {
          id: Date.now(),
          title: broadcastTitle,
          message: broadcastMessage,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          author: "Dr. Simon - Project Coordinator" // This would come from your auth context/profile
        };

        setSentBroadcasts([newBroadcast, ...sentBroadcasts]);
        setBroadcastTitle("");
        setBroadcastMessage("");
        toast.success("Broadcast sent successfully to all students!");
        setIsSending(false);
      }, 800);

    } catch (error) {
      toast.error("Failed to send broadcast.");
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-full p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: BRAND }}>Coordinator Dashboard</h1>
        <p className="text-gray-500 font-medium">Welcome to the central command center for the PASS system.</p>
      </div>

      {/* Top Row: System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><FiUsers size={24} style={{ color: BRAND }} /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Total Students</p>
            <p className="text-2xl font-extrabold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 rounded-xl"><FiClipboard size={24} className="text-purple-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Supervisors</p>
            <p className="text-2xl font-extrabold text-gray-800">{stats.totalSupervisors}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl"><FiActivity size={24} className="text-green-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Active Panels</p>
            <p className="text-2xl font-extrabold text-gray-800">{stats.activePanels}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Broadcast Composer (Takes up 2/5 of space) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiMessageSquare size={20} style={{ color: BRAND }} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">Send Notice</h2>
            </div>
            
            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-500 mb-2 block">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g., URGENT: Milestone 1 Formatting..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 mb-2 block">Message Body</label>
                <textarea
                  placeholder="Type your broadcast message to all students here..."
                  rows={5}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                style={{ backgroundColor: BRAND }}
              >
                {isSending ? "Sending..." : "Send Broadcast to All"}
                {!isSending && <FiSend size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Broadcast History (Takes up 3/5 of space) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm h-full">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6">Recent Broadcasts Sent</h2>
            
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
              {sentBroadcasts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-bold">No broadcasts sent yet.</div>
              ) : (
                sentBroadcasts.map((broadcast) => (
                  /* Formatted to closely resemble the student's view from your screenshot */
                  <div key={broadcast.id} className="border-2 border-blue-100 rounded-2xl p-5 shadow-sm bg-white relative">
                    <div className="flex items-start gap-4">
                      {/* Fake User Icon */}
                      <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white mt-1">
                        <FiUser size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col mb-2">
                          <span className="font-extrabold text-blue-700 text-lg">{broadcast.author}</span>
                          <span className="text-gray-500 font-bold text-sm">{broadcast.date}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{broadcast.title}</h3>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                          {broadcast.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoordinatorDashboard;