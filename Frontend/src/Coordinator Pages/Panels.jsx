import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiPlus, FiGrid, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CreatePanelModal from "./Coordinator Panel Components/CreatePanelModal"

const BRAND = "#2b20d6";

// ─── Modern Empty State ──────────────────────────────────────────────────────
const NoPanels = ({ onSetup }) => (
  <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-6">
    <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center text-center max-w-lg w-full shadow-2xl shadow-indigo-100 border border-indigo-50">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
        <FiGrid size={48} style={{ color: BRAND }} />
      </div>
      <h3 className="text-3xl font-black mb-4" style={{ color: BRAND }}>Initialize Panels</h3>
      <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">
        Every academic cycle needs a structured examination committee. 
        Start by generating the required number of panels for this cohort.
      </p>
      <button
        onClick={onSetup}
        className="group flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg hover:scale-105 transition-all"
        style={{ backgroundColor: BRAND }}
      >
        <FiPlus size={24} />
        Setup the Panels
      </button>
    </div>
  </div>
);

// ─── Refined Panel Card ──────────────────────────────────────────────────────
const PanelCard = ({ panel, onSetup, onDelete }) => (
  <div className="bg-white rounded-2xl border-2 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative"
       style={{ borderColor: BRAND }}>
    
    {/* --- Delete Individual Panel --- */}
    <button 
      onClick={() => onDelete(panel.panelId)}
      className="absolute top-4 right-4 p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
      title="Delete Panel"
    >
      <FiTrash2 size={18} />
    </button>

    <h3 className="text-xl font-extrabold text-[#2b20d6]">Panel {panel.panelNumber}</h3>
    <p className="text-sm text-gray-400 font-semibold uppercase tracking-tighter">Coordinator Selection</p>

    <div className="space-y-3 py-2">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-400">Chair</span>
        <span className="text-gray-800">{panel.chairName || "Not Assigned"}</span>
      </div>
      
      {/* --- Progress bar updated to calculate out of 4 members --- */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full" 
          style={{ width: `${(panel.memberCount / 4) * 100}%` }}
        />
      </div>
      
      {/* --- Text explicitly states /4 maximum --- */}
      <div className="flex justify-between text-xs font-black text-gray-500 uppercase">
        <span>Members: {panel.memberCount}/4</span>
        <span>{panel.studentCount} Students</span>
      </div>
    </div>

    {/* --- Configure Panel Button --- */}
    <button
      onClick={() => onSetup(panel.panelId)}
      className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-[#2b20d6] text-[#2b20d6] bg-[#eef0fb] hover:bg-[#2b20d6] hover:text-white transition-all duration-300 ease-in-out"
    >
      Configure Panel →
    </button>
  </div>
);

// ─── Ghost Add Card ──────────────────────────────────────────────────────────
const AddPanelCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="rounded-3xl border-4 border-dashed border-indigo-100 flex flex-col items-center justify-center gap-4 hover:border-[#2b20d6] hover:bg-white transition-all min-h-[280px] group"
  >
    <div className="w-16 h-16 rounded-full border-4 border-dashed border-indigo-100 group-hover:border-[#2b20d6] flex items-center justify-center transition-all">
      <FiPlus size={32} className="text-indigo-200 group-hover:text-[#2b20d6]" />
    </div>
    <p className="font-black text-lg text-indigo-200 group-hover:text-[#2b20d6]">Add a Panel</p>
  </button>
);

// ─── Main Panels Component ──────────────────────────────────────────────────
const Panels = () => {
  const [panels, setPanels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchPanels = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/coordinator/panels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) setPanels(result.data || []);
      else toast.error(result.message || "Could not load panels.");
    } catch {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL panels for this cycle? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/coordinator/panels/delete-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("All panels deleted successfully");
        fetchPanels(); 
      }
    } catch (error) {
      toast.error("Failed to delete all panels.");
    }
  };

  const handleDeletePanel = async (panelId) => {
    if (!window.confirm("Are you sure you want to delete this panel? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/coordinator/panels/${panelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Panel deleted successfully");
        fetchPanels(); 
      } else {
        toast.error(data.message || "Failed to delete panel");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  const handleQuickAddOne = async () => {
    if (panels.length >= 6) {
      return toast.info("Maximum limit of 6 panels reached.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/coordinator/generate-panels", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ count: 1 })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Panel added successfully");
        fetchPanels(); 
      } else {
        toast.error(data.message || "Failed to add panel");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  useEffect(() => { fetchPanels(); }, []);

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
        <FiGrid size={64} className="text-indigo-200 mb-4" />
        <p className="text-xl font-black text-indigo-300">Syncing Committee Data...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {panels.length === 0 ? (
        <NoPanels onSetup={() => setShowCreate(true)} />
      ) : (
        <div className="flex-1 overflow-y-auto px-2 pb-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-4xl font-black mb-1" style={{ color: BRAND }}>Panels</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Academic Examination Committee</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all"
              >
                Clear All
              </button>
              {panels.length < 6 && (
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2b20d6] text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
                >
                    <FiPlus size={20} /> New Panel
                </button>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {panels.map((p) => (
              <PanelCard
                key={p.panelId}
                panel={p}
                onSetup={(id) => navigate(`/coordinator/panels/${id}`)}
                onDelete={handleDeletePanel} 
              />
            ))}
            
            {panels.length < 6 && (
              <AddPanelCard onClick={async () => {
                if (panels.length >= 6) {
                  return toast.info("Maximum limit of 6 panels reached.");
                }
                if (panels.length >= 1) {
                    handleQuickAddOne(); 
                } else {
                    setShowCreate(true); 
                }
              }} />
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <CreatePanelModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchPanels(); }}
        />
      )}
    </div>
  );
};

export default Panels;