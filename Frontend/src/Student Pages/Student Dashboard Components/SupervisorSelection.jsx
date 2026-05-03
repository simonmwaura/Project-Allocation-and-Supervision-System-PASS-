import { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import ProjectPitch from "./ProjectPitch";

const BRAND = "#302AE2";

// Fixed: "Internet of Things" matches the DB tag exactly. "Networking" removed (not in DB).
// Instead of a hardcoded list, we derive unique interests dynamically from the supervisors
// array so this never goes out of sync with the DB again.
const CARDS_PER_PAGE = 6;
const MAX_PITCHES = 3;

// --- Avatar Component ---
const AvatarIcon = ({ full }) => (
  <div
    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
    style={{
      backgroundColor: full ? "#e2e8f0" : "#dde0ff",
      border: `2px solid ${full ? "#94a3b8" : BRAND}`,
    }}
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={full ? "#94a3b8" : BRAND} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={full ? "#94a3b8" : BRAND} />
    </svg>
  </div>
);

// --- Supervisor Card Component ---
const SupervisorCard = ({ supervisor, onPitch, existingPitch, onViewPitch, pitchesLeft }) => {
  const { name, email, interests, slotsTotal, slotsFilled } = supervisor;
  const isFull = slotsFilled >= slotsTotal;
  const visibleInterests = interests.slice(0, 2);
  const extraCount = interests.length - 2;

  const isDeclined = existingPitch?.status === "Declined";
  const isPending = existingPitch?.status === "Pending" || (existingPitch && !existingPitch.status);

  return (
    <div
      className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative"
      style={{ borderColor: isDeclined ? "#ef4444" : BRAND }}
    >
      <div className="flex items-center gap-3">
        <AvatarIcon full={isFull} />
        <div className="min-w-0 flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base text-gray-800 truncate">{name}</p>
              {isDeclined && (
                <span className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">
                  Declined
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleInterests.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600"
          >
            {tag}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600">
            +{extraCount} More
          </span>
        )}
      </div>

      <div className="flex-1" />

      <p className="text-sm text-gray-700">
        <span className="font-bold">Availability:</span>{" "}
        <span className="font-medium" style={!isFull ? {} : { color: "#94a3b8" }}>
          {slotsFilled}/{slotsTotal} Slots Filled
        </span>
      </p>

      <div className="w-full flex flex-col items-center">
        {isDeclined ? (
          <button
            onClick={() => onViewPitch(existingPitch)}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-white text-red-600 border border-red-600 hover:bg-red-50 transition-colors shadow-sm"
          >
            View Feedback
          </button>
        ) : isPending ? (
          <button
            onClick={() => onViewPitch(existingPitch)}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 border border-gray-400 hover:bg-gray-300 transition-colors shadow-sm"
          >
            Pending (View Pitch)
          </button>
        ) : (
          <button
            onClick={() => !isFull && pitchesLeft > 0 && onPitch(supervisor)}
            disabled={isFull || pitchesLeft === 0}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity"
            style={{
              backgroundColor: isFull ? "#94a3b8" : BRAND,
              cursor: isFull || pitchesLeft === 0 ? "not-allowed" : "pointer",
              opacity: pitchesLeft === 0 && !isFull ? 0.6 : 1,
            }}
          >
            {isFull ? "Capacity Reached" : "Pitch Project"}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Selection Component ---
const SupervisorSelection = ({ supervisors = [], refreshDashboard, activePitches = [], onViewPitch }) => {
  const [search, setSearch] = useState("");
  const [interest, setInterest] = useState("All Interests");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build the interest filter options dynamically from real supervisor data.
  // This means it will always match the DB exactly — no manual upkeep needed.
  const allInterests = [
    "All Interests",
    ...Array.from(new Set(supervisors.flatMap((s) => s.interests))).sort(),
  ];

  const pendingCount = activePitches.filter((p) => p.status !== "Declined").length;
  const pitchesLeft = MAX_PITCHES - pendingCount;

  const handlePitchSubmit = async ({ projectTitle, projectPitch }) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/students/pitch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supervisor_id: selectedSupervisor.id,
          title: projectTitle,
          description: projectPitch,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedSupervisor(null);
        refreshDashboard();
      } else {
        toast.error(data.message || "Failed to submit pitch.");
      }
    } catch (error) {
      toast.error("Network error. Could not submit pitch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Swap to the pitch form
  if (selectedSupervisor) {
    return (
      <ProjectPitch
        supervisor={selectedSupervisor}
        onBack={() => setSelectedSupervisor(null)}
        onSubmit={handlePitchSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  const filtered = supervisors.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesInterest =
      interest === "All Interests" || s.interests.includes(interest);
    return matchesSearch && matchesInterest;
  });

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pt-2 pb-8 relative z-0">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2" style={{ color: BRAND }}>
        Dashboard: Supervisor Selection
      </h2>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <div className="flex-1 flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by supervisor name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between gap-3 bg-white border border-gray-300 rounded-xl px-5 py-3 text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap min-w-[200px]"
          >
            {interest}
            <FiChevronDown
              size={18}
              className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-full min-w-[200px] overflow-hidden max-h-64 overflow-y-auto">
              {allInterests.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setInterest(opt); setDropdownOpen(false); setPage(1); }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-indigo-50 ${
                    interest === opt ? "font-bold text-blue-700 bg-blue-50/50" : "text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Header row */}
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="font-bold text-lg" style={{ color: BRAND }}>
          Available Supervisors
        </p>
        <p
          className="font-semibold text-sm bg-blue-50 px-3 py-1.5 rounded-lg border"
          style={{ color: BRAND, borderColor: `${BRAND}40` }}
        >
          Pitches Remaining: {pitchesLeft}/{MAX_PITCHES}
        </p>
      </div>

      {/* Cards Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg font-medium">
            No supervisors found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((s) => {
            const existingPitch = activePitches.find((p) => p.supervisor_id === s.id);
            return (
              <SupervisorCard
                key={s.id}
                supervisor={s}
                onPitch={setSelectedSupervisor}
                existingPitch={existingPitch}
                onViewPitch={onViewPitch}
                pitchesLeft={pitchesLeft}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-bold border disabled:opacity-40 hover:bg-gray-50 transition-colors"
            style={{ color: BRAND, borderColor: BRAND }}
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-bold border disabled:opacity-40 hover:bg-gray-50 transition-colors"
            style={{ color: BRAND, borderColor: BRAND }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SupervisorSelection;