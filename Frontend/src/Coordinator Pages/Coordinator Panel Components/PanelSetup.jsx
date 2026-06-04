import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers, FiUser, FiHash, FiPlus, FiArrowLeft, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2"; // Locked to your strict theme

// ─── ADD SUPERVISOR MODAL ────────────────────────────────────────────────────
const AddSupervisorModal = ({ isOpen, onClose, onAdd, panelId }) => {
  const [eligible, setEligible] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchEligible = async () => {
        try {
          const token = localStorage.getItem("token");
          // FIXED BUG: plural /coordinators/
          const res = await fetch(`http://127.0.0.1:5000/api/coordinators/panels/${panelId}/eligible-supervisors`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) setEligible(data.data || []);
        } catch (error) {
          toast.error("Failed to fetch available supervisors.");
        } finally {
          setLoading(false);
        }
      };
      fetchEligible();
    }
  }, [isOpen, panelId]);

  if (!isOpen) return null;

  const filtered = eligible.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold mb-2" style={{ color: BRAND }}>Add Supervisor</h3>
        <p className="text-sm text-gray-400 mb-6 font-medium">Showing available supervisors with active accounts.</p>
        
        <input 
          type="text" 
          placeholder="Search by name..."
          className="w-full h-12 px-5 rounded-2xl border-2 border-gray-100 outline-none mb-4 font-medium transition-colors"
          onFocus={(e) => e.target.style.borderColor = BRAND}
          onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            <p className="text-center py-4 text-gray-400 animate-pulse">Checking availability...</p>
          ) : filtered.length > 0 ? (
            filtered.map(s => (
              <button 
                key={s.id}
                onClick={() => onAdd(s.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50 transition-all group border border-transparent"
              >
                <div className="text-left">
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{s.email}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: BRAND }}>
                  <FiPlus size={20} />
                </div>
              </button>
            ))
          ) : (
            <p className="text-center py-4 text-gray-400 font-medium italic">No available supervisors found.</p>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const PanelSetup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddSup, setShowAddSup] = useState(false);
  
  const [panel, setPanel] = useState(null);
  const [capacity, setCapacity] = useState(4);
  const [chairId, setChairId] = useState("");

  const fetchPanelDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      // FIXED BUG: plural /coordinators/
      const res = await fetch(`http://127.0.0.1:5000/api/coordinators/panels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPanel(data.data);
        setCapacity(data.data.maxCapacity);
        setChairId(data.data.chairId || "");
      } else {
        toast.error(data.message || "Failed to load panel");
        navigate("/coordinator/panels"); 
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPanelDetails();
  }, [id]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // FIXED BUG: plural /coordinators/
      const res = await fetch(`http://127.0.0.1:5000/api/coordinators/panels/${id}/settings`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ max_capacity: capacity, chair_id: chairId })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Settings updated!");
        fetchPanelDetails(); 
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSupervisor = async (supId) => {
    try {
      const token = localStorage.getItem("token");
      // FIXED BUG: plural /coordinators/
      const res = await fetch(`http://127.0.0.1:5000/api/coordinators/panels/${id}/add-member`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ supervisor_id: supId })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Supervisor added!");
        setShowAddSup(false);
        fetchPanelDetails(); 
      } else {
        toast.error(data.message || "Failed to add supervisor");
      }
    } catch (error) {
      toast.error("Network error adding supervisor");
    }
  };

  if (isLoading || !panel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse h-full min-h-[50vh]">
        <FiUsers size={64} style={{ color: BRAND }} className="opacity-50 mb-4" />
        <p className="text-xl font-black" style={{ color: BRAND }}>Loading Panel Data...</p>
      </div>
    );
  }

  const members = panel.members || [];

 return (
    <div className="flex flex-col h-full overflow-y-auto pb-12 px-4 md:px-6 relative">
      
      <div className="w-full max-w-5xl mx-auto">
        
        {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-4 pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-gray-500 hover:text-[#302AE2] hover:border-[#302AE2] transition-colors"
              title="Back to Panels"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: BRAND }}>
                Panel {panel.panelNumber}
              </h2>
              <p className="text-gray-500 font-semibold text-sm">Configuration & Members</p>
            </div>
          </div>
        </div>

        {/* ─── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* 1. SUMMARY CARD */}
          <div className="bg-white rounded-[24px] border-2 border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FiUsers size={36} style={{ color: BRAND }} />
            </div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: BRAND }}>
              Overview
            </h3>
            
            <div className="w-full flex flex-col gap-4 text-sm font-semibold text-gray-800">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Panel Chair</span> 
                <span className={panel.chairName !== "Unassigned" ? "text-gray-900 font-extrabold" : "text-gray-400 italic"}>
                  {panel.chairName}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Supervisors</span> 
                <span className="text-gray-900 font-extrabold">{members.length} <span className="text-gray-400 font-medium">/ {panel.maxCapacity}</span></span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Students</span> 
                <span className="text-gray-900 font-extrabold">{panel.studentCount || 0} Allocated</span>
              </div>
            </div>
          </div>

          {/* 2. SETTINGS CARD */}
          <div className="bg-white rounded-[24px] border-2 border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6" style={{ color: BRAND }}>
              Panel Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block ml-1 uppercase tracking-wider">Capacity</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiHash size={18} />
                  </div>
                  <select 
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="w-full h-14 pl-12 pr-10 rounded-xl border-2 border-gray-100 text-gray-700 font-medium appearance-none outline-none transition-colors bg-white cursor-pointer"
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
                  >
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block ml-1 uppercase tracking-wider">Designate Chair</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiUser size={18} />
                  </div>
                  <select 
                    value={chairId}
                    onChange={(e) => setChairId(e.target.value)}
                    className="w-full h-14 pl-12 pr-10 rounded-xl border-2 border-gray-100 text-gray-700 font-medium appearance-none outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                    disabled={members.length === 0}
                    onFocus={(e) => e.target.style.borderColor = BRAND}
                    onBlur={(e) => e.target.style.borderColor = "#f3f4f6"}
                  >
                    <option value="" disabled>Select a panel chair below</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {members.length === 0 && (
                  <p className="text-xs text-red-400 mt-2 ml-1 font-medium">Add supervisors first to select a chair.</p>
                )}
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full mt-2 h-14 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center disabled:opacity-70" 
                style={{ backgroundColor: BRAND }}
              >
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>

          {/* 3. SUPERVISORS CARD (Upgraded UI) */}
          <div className="bg-white rounded-[24px] border-2 border-gray-100 p-8 shadow-sm flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: BRAND }}>Members</h3>
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {members.length} / {panel.maxCapacity}
              </span>
            </div>
            
            {/* Added: Explicit list of members */}
            <div className="flex flex-col gap-3 mb-8 flex-1">
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <FiUsers size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium italic">No supervisors assigned yet.</p>
                </div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="font-bold text-gray-800 text-sm">{m.name}</span>
                    {m.role === 'Chair' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
                        <FiShield size={10} /> CHAIR
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setShowAddSup(true)}
              disabled={members.length >= panel.maxCapacity}
              className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:border-[#302AE2] hover:text-[#302AE2] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus size={18} />
              Add Supervisor
            </button>
          </div>

          {/* 4. ALLOCATED STUDENTS CARD */}
          <div className="bg-white rounded-[24px] border-2 border-red-200 p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="text-xl font-bold mb-3 text-red-600">Danger Zone</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Clearing students from this panel will completely revoke their presentation slots for this academic cycle. Their uploaded project documents will remain safely stored in the database.
              </p>
            </div>
            <div className="flex justify-end mt-8">
              <button className="px-6 py-3 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors border border-red-100 shadow-sm w-full sm:w-auto">
                Clear Allocated Students
              </button>
            </div>
          </div>

        </div>
      </div>

      <AddSupervisorModal 
        isOpen={showAddSup} 
        onClose={() => setShowAddSup(false)} 
        onAdd={handleAddSupervisor}
        panelId={id}
      />
    </div>
  );
};

export default PanelSetup;