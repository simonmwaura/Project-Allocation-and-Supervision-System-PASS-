import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers, FiUser, FiHash, FiPlus, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

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
          const res = await fetch(`http://127.0.0.1:5000/api/coordinator/panels/${panelId}/eligible-supervisors`, {
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
        <h3 className="text-2xl font-bold mb-2 text-[#2b20d6]">Add Supervisor</h3>
        <p className="text-sm text-gray-400 mb-6 font-medium">Showing available supervisors with active accounts.</p>
        
        <input 
          type="text" 
          placeholder="Search by name..."
          className="w-full h-12 px-5 rounded-2xl border-2 border-[#eef0fb] focus:border-[#2b20d6] outline-none mb-4 font-medium"
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
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#eef0fb] transition-all group border border-transparent hover:border-[#2b20d6]/10"
              >
                <div className="text-left">
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{s.email}</p>
                </div>
                <FiPlus className="text-[#2b20d6] opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </button>
            ))
          ) : (
            <p className="text-center py-4 text-gray-400 font-medium italic">No available supervisors found.</p>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
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
  const [showAddSup, setShowAddSup] = useState(false); // Modal state
  
  const [panel, setPanel] = useState(null);
  const [capacity, setCapacity] = useState(4);
  const [chairId, setChairId] = useState("");

  const fetchPanelDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/coordinator/panels/${id}`, {
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
      const res = await fetch(`http://127.0.0.1:5000/api/coordinator/panels/${id}/settings`, {
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

  // Add Supervisor function
  const handleAddSupervisor = async (supId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/coordinator/panels/${id}/add-member`, {
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
        fetchPanelDetails(); // Refresh to show new counts
      } else {
        toast.error(data.message || "Failed to add supervisor");
      }
    } catch (error) {
      toast.error("Network error adding supervisor");
    }
  };

  if (isLoading || !panel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse h-full">
        <FiUsers size={64} className="text-indigo-200 mb-4" />
        <p className="text-xl font-black text-indigo-300">Loading Panel Data...</p>
      </div>
    );
  }

  const members = panel.members || [];

 return (
    <div className="flex flex-col h-full overflow-y-auto pb-10 px-4 relative">
      
      {/* ─── CENTERING WRAPPER ─── */}
      <div className="w-full max-w-5xl mx-auto">
        
        {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BRAND }}
          >
            <FiArrowLeft size={18} />
            Back to Panels
          </button>
          <h2 className="text-3xl font-extrabold text-[#2b20d6]">
            Panel {panel.panelNumber} Setup
          </h2>
        </div>

        {/* ─── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. SUMMARY CARD */}
          <div className="bg-white rounded-[24px] border-2 border-[#eef0fb] p-8 shadow-sm flex flex-col items-center">
            <FiUsers size={48} style={{ color: BRAND }} className="mb-2" />
            <h3 className="text-2xl font-bold mb-4" style={{ color: BRAND }}>
              Panel {panel.panelNumber}
            </h3>
            <div className="w-full border-t border-dashed border-gray-300 mb-4"></div>
            <div className="w-full flex flex-col gap-3 text-sm font-semibold text-gray-800">
              <p className="flex justify-between">
                <span className="text-gray-500 font-bold">Panel Chair :</span> 
                <span className={panel.chairName !== "Unassigned" ? "text-gray-800" : "text-gray-400 font-normal"}>{panel.chairName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 font-bold">Supervisors :</span> 
                <span className="text-gray-400 font-normal">{members.length}/{panel.maxCapacity} Assigned</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 font-bold">Students :</span> 
                <span className="text-gray-400 font-normal">{panel.studentCount || 0} Allocated</span>
              </p>
            </div>
          </div>

          {/* 2. SETTINGS CARD */}
          <div className="bg-white rounded-[24px] border-2 border-[#eef0fb] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: BRAND }}>
              Panel Settings
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block ml-1">Panel Capacity</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2b20d6]">
                    <FiHash size={18} />
                  </div>
                  <select 
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="w-full h-12 pl-12 pr-10 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium appearance-none focus:outline-none focus:border-[#2b20d6] transition-colors bg-white cursor-pointer"
                  >
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block ml-1">Panel Chair</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FiUser size={18} />
                  </div>
                  <select 
                    value={chairId}
                    onChange={(e) => setChairId(e.target.value)}
                    className="w-full h-12 pl-12 pr-10 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium appearance-none focus:outline-none focus:border-[#2b20d6] transition-colors bg-white cursor-pointer"
                    disabled={members.length === 0}
                  >
                    <option value="" disabled>Select a panel chair below</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {members.length === 0 && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Add supervisors first to select a chair.</p>
                )}
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full mt-4 h-12 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center justify-center disabled:opacity-70" 
                style={{ backgroundColor: BRAND }}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* 3. SUPERVISORS CARD */}
          <div className="bg-white rounded-[24px] border-2 border-[#eef0fb] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: BRAND }}>Supervisors</h3>
              <p className="text-sm font-medium text-gray-500">
                {members.length} supervisors have been assigned to this panel.
              </p>
            </div>
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setShowAddSup(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border-2 border-[#2b20d6] text-[#2b20d6] hover:bg-[#2b20d6] hover:text-white transition-all w-full justify-center"
              >
                <FiPlus size={18} />
                Add Supervisor
              </button>
            </div>
          </div>

          {/* 4. ALLOCATED STUDENTS CARD */}
          <div className="bg-white rounded-[24px] border-2 border-[#ff3333] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <h3 className="text-lg font-bold mb-2 text-[#2b20d6]">Allocated Students</h3>
              <p className="text-sm font-medium text-gray-500 leading-tight">
                Removing students from this panel will revoke their presentation slots. Their project data will remain safe in the database.
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#e50000] hover:bg-red-700 transition-colors shadow-sm">
                Clear Students
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Render the modal component */}
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