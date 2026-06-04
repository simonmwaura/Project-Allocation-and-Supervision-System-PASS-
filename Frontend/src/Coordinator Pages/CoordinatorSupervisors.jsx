import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiUsers, FiSearch, FiAlertTriangle, FiCheckCircle,
  FiSliders, FiSend, FiX, FiMinus, FiPlus, FiClock,
  FiAlertCircle, FiBarChart2
} from "react-icons/fi";

const BRAND = "#2b20d6";

// ─── Capacity Override Modal ──────────────────────────────────────────────────
const CapacityModal = ({ supervisor, coordinatorYear, onClose, onSave }) => {
  const current = coordinatorYear === "2"
    ? supervisor.max2ndYear
    : supervisor.max4thYear;
  const [value, setValue] = useState(current);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (value < 1 || value > 15) return toast.error("Capacity must be between 1 and 15.");
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:5000/api/coordinators/supervisors/${supervisor.id}/override-capacity`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ year: coordinatorYear, capacity: value }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Capacity updated to ${value} for ${supervisor.firstName} ${supervisor.lastName}.`);
        onSave();
        onClose();
      } else {
        toast.error(data.message || "Failed to update capacity.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border-2 w-full max-w-md p-8 shadow-2xl"
        style={{ borderColor: BRAND }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold" style={{ color: BRAND }}>
              Override Capacity
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Dr. {supervisor.firstName} {supervisor.lastName} ·{" "}
              {coordinatorYear === "2" ? "2nd" : "4th"} Year slots
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={22} />
          </button>
        </div>

        {/* Current vs new */}
        <div className="flex flex-col gap-1.5 mb-2">
          <label className="text-sm font-semibold text-gray-600">
            Standard cap is 7. You can raise or lower this for this supervisor.
          </label>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-6 my-6">
          <button
            onClick={() => setValue((v) => Math.max(1, v - 1))}
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xl hover:bg-gray-50 transition-colors"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            <FiMinus size={18} />
          </button>
          <div className="text-center">
            <span className="text-5xl font-extrabold" style={{ color: BRAND }}>{value}</span>
            <p className="text-xs text-gray-400 mt-1">students</p>
          </div>
          <button
            onClick={() => setValue((v) => Math.min(15, v + 1))}
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xl hover:bg-gray-50 transition-colors"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            <FiPlus size={18} />
          </button>
        </div>

        {value !== current && (
          <p className="text-xs text-center text-amber-600 font-semibold mb-4">
            Changing from {current} → {value} slots
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || value === current}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            {isSaving ? "Saving..." : "Confirm Override"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ sup }) => {
  const isFull     = sup.accepted >= sup.maxCapacity;
  const hasIgnored = sup.pendingPitches > 0 && sup.accepted === 0;
  const isSlowing  = sup.pendingPitches > 3;

  if (isFull)    return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-100 text-red-600">Full</span>;
  if (hasIgnored)return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-100 text-orange-600">Not Responding</span>;
  if (isSlowing) return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-yellow-100 text-yellow-700">Backlog</span>;
  return           <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-green-100 text-green-600">Active</span>;
};

// ─── Supervisor Card ──────────────────────────────────────────────────────────
const SupervisorCard = ({ sup, coordinatorYear, onOverride, onRefresh }) => {
  const isFull   = sup.accepted >= sup.maxCapacity;
  const pct      = sup.maxCapacity > 0 ? Math.min((sup.accepted / sup.maxCapacity) * 100, 100) : 0;
  const barColor = isFull ? "#ef4444" : pct > 70 ? "#f59e0b" : BRAND;

  const handleNudge = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:5000/api/coordinators/supervisors/${sup.id}/nudge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    toast.success(`Reminder sent to ${sup.email}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-6 gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold text-white shrink-0"
            style={{ backgroundColor: BRAND }}
          >
            {sup.firstName[0]}{sup.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-800 truncate">
              Dr. {sup.firstName} {sup.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{sup.email}</p>
          </div>
        </div>
        <StatusChip sup={sup} />
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-gray-500">
            {coordinatorYear === "2" ? "2nd" : "4th"} Year Capacity
          </span>
          <span style={{ color: barColor }}>
            {sup.accepted} / {sup.maxCapacity} Accepted
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Pitch stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
        <div className="pr-2">
          <p className="text-lg font-extrabold text-gray-800">{sup.accepted}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Approved</p>
        </div>
        <div className="px-2">
          <p
            className="text-lg font-extrabold"
            style={{ color: sup.pendingPitches > 3 ? "#f59e0b" : "#374151" }}
          >
            {sup.pendingPitches}
          </p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Pending</p>
        </div>
        <div className="pl-2">
          <p className="text-lg font-extrabold text-gray-800">{sup.declined}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Declined</p>
        </div>
      </div>

      {/* Warning banner */}
      {sup.pendingPitches > 0 && sup.accepted === 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
          <FiAlertTriangle size={14} className="text-orange-500 shrink-0" />
          <p className="text-xs font-semibold text-orange-700">
            {sup.pendingPitches} pitch{sup.pendingPitches > 1 ? "es" : ""} waiting — no approvals yet
          </p>
        </div>
      )}
      {sup.pendingPitches > 3 && sup.accepted > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
          <FiClock size={14} className="text-yellow-600 shrink-0" />
          <p className="text-xs font-semibold text-yellow-700">
            Pitch backlog: {sup.pendingPitches} students waiting for a decision
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-2 border-t border-gray-100">
        <button
          onClick={() => onOverride(sup)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border-2 hover:bg-indigo-50 transition-colors"
          style={{ borderColor: BRAND, color: BRAND }}
        >
          <FiSliders size={13} /> Override Capacity
        </button>
        {sup.pendingPitches > 0 && (
          <button
            onClick={handleNudge}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border-2 border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <FiSend size={13} /> Nudge
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CoordinatorSupervisors = () => {
  const [supervisors, setSupervisors]     = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [coordinatorYear, setCoordinatorYear] = useState("2");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [supRes, meRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/coordinators/supervisors-overview", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://127.0.0.1:5000/api/coordinators/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCoordinatorYear(meData.data.year || "2");
      }

      if (supRes.ok) {
        const data = await supRes.json();
        setSupervisors(data.data || []);
      } else {
        toast.error("Could not load supervisors.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived stats
  const total       = supervisors.length;
  const fullCount   = supervisors.filter((s) => s.accepted >= s.maxCapacity).length;
  const notResp     = supervisors.filter((s) => s.pendingPitches > 0 && s.accepted === 0).length;
  const backlogSups = supervisors.filter((s) => s.pendingPitches > 3).length;
  const totalApproved = supervisors.reduce((a, s) => a + s.accepted, 0);
  const totalPending  = supervisors.reduce((a, s) => a + s.pendingPitches, 0);

  // Filter + search
  const filtered = supervisors
    .filter((s) => {
      if (filterStatus === "full")        return s.accepted >= s.maxCapacity;
      if (filterStatus === "notresponding") return s.pendingPitches > 0 && s.accepted === 0;
      if (filterStatus === "backlog")     return s.pendingPitches > 3;
      return true;
    })
    .filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <p className="text-xl font-bold animate-pulse" style={{ color: BRAND }}>Loading supervisor data...</p>
    </div>
  );

  return (
    <div className="w-full p-6 pb-16 flex flex-col gap-8">

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold" style={{ color: BRAND }}>Supervisor Management</h1>
        <p className="text-gray-500 mt-1 font-medium">
          Monitor pitch responsiveness, approved students, and override capacities for {coordinatorYear === "2" ? "2nd" : "4th"} year.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: FiUsers,       label: "Total Supervisors",  value: total,         bg: "#eef0ff", ic: BRAND },
          { icon: FiCheckCircle, label: "Total Approved",     value: totalApproved, bg: "#dcfce7", ic: "#16a34a" },
          { icon: FiClock,       label: "Pending Pitches",    value: totalPending,  bg: "#fef9c3", ic: "#ca8a04" },
          { icon: FiAlertTriangle, label: "Not Responding",   value: notResp,       bg: "#ffedd5", ic: "#ea580c" },
          { icon: FiBarChart2,   label: "Full Capacity",      value: fullCount,     bg: "#fee2e2", ic: "#dc2626" },
        ].map(({ icon: Icon, label, value, bg, ic }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color: ic }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{label}</p>
              <p className="text-2xl font-extrabold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <FiSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by supervisor name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            ["all",          "All",           "#eef0ff", BRAND],
            ["notresponding","Not Responding","#ffedd5","#ea580c"],
            ["backlog",      "Pitch Backlog", "#fef9c3","#ca8a04"],
            ["full",         "Full",          "#fee2e2","#dc2626"],
          ].map(([val, label, bg, col]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors"
              style={{
                borderColor: filterStatus === val ? col : "#e5e7eb",
                backgroundColor: filterStatus === val ? bg : "white",
                color: filterStatus === val ? col : "#6b7280",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 font-semibold py-16">
          No supervisors match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((sup) => (
            <SupervisorCard
              key={sup.id}
              sup={sup}
              coordinatorYear={coordinatorYear}
              onOverride={setOverrideTarget}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {/* Capacity modal */}
      {overrideTarget && (
        <CapacityModal
          supervisor={overrideTarget}
          coordinatorYear={coordinatorYear}
          onClose={() => setOverrideTarget(null)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

export default CoordinatorSupervisors;