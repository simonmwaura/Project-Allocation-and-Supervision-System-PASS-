import { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import ProjectPitch from "./ProjectPitch";
import WithdrawModal from "./WithdrawModal"; 
import PendingPitchDetails from "./PendingPitchDetails"; // <-- Import the new details page

const BRAND = "#302AE2";

const ALL_INTERESTS = ["All Interests", "Web Development", "Artificial Intelligence", "Data Science", "Cybersecurity", "Cloud Computing", "Machine Learning", "IoT", "Networking"];
const CARDS_PER_PAGE = 6;

// --- Avatar Component ---
const AvatarIcon = ({ full }) => (
  <div
    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: full ? "#e2e8f0" : "#dde0ff", border: `2px solid ${full ? "#94a3b8" : BRAND}` }}
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={full ? "#94a3b8" : BRAND} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={full ? "#94a3b8" : BRAND} />
    </svg>
  </div>
);

// --- Supervisor Card Component ---
const SupervisorCard = ({ supervisor, pitchesLeft, onPitch, isPitched, onViewPitch }) => {
  const { name, email, interests, slotsTotal, slotsFilled } = supervisor;
  const isFull = slotsFilled >= slotsTotal;
  const visibleInterests = interests.slice(0, 2);
  const extraCount = interests.length - 2;

  return (
    <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: BRAND }}>
      <div className="flex items-center gap-3">
        <AvatarIcon full={isFull} />
        <div className="min-w-0">
          <p className="font-bold text-base text-gray-800 truncate">{name}</p>
          <p className="text-sm text-gray-400 truncate">{email}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleInterests.map((tag) => (
          <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600">{tag}</span>
        ))}
        {extraCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-400 bg-[#f4f0f0] text-gray-600">+{extraCount} More</span>
        )}
      </div>
      
      <div className="flex-1"></div>
      
      <p className="text-sm text-gray-700">
        <span className="font-bold">Availability:</span>{" "}
        <span className="font-medium" style={!isFull ? {} : { color: "#94a3b8" }}>
          {slotsFilled}/{slotsTotal} Slots Filled
        </span>
      </p>

      {/* Buttons */}
      <div className="w-full flex flex-col items-center">
        {isPitched ? (
          <button
            onClick={() => onViewPitch(supervisor.id)} // Go to details page
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
const SupervisorSelection = ({ supervisors = [], maxPitches = 3 }) => {
  const [search, setSearch] = useState("");
  const [interest, setInterest] = useState("All Interests");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  
  // Track array of pitched supervisor IDs
  const [pitchedSupervisors, setPitchedSupervisors] = useState([]);
  
  // NEW STATES for the View/Withdraw flow
  const [viewingPitchId, setViewingPitchId] = useState(null);
  const [withdrawModalId, setWithdrawModalId] = useState(null);

  const pitchesLeft = maxPitches - pitchedSupervisors.length;

  // The actual withdraw logic that fires when "Yes, Withdraw" is clicked in the modal
  const handleConfirmWithdraw = () => {
    if (withdrawModalId) {
      setPitchedSupervisors((prev) => prev.filter((id) => id !== withdrawModalId));
      setWithdrawModalId(null); // Close the modal
      setViewingPitchId(null);  // Return to the grid automatically!
    }
  };

  // 1. Render the form to CREATE a new pitch
  if (selectedSupervisor) {
    return (
      <ProjectPitch
        supervisor={selectedSupervisor}
        onBack={() => setSelectedSupervisor(null)}
        onSubmit={({ projectTitle, projectPitch, attachedFile }) => {
          setPitchedSupervisors((prev) => [...prev, selectedSupervisor.id]);
          setSelectedSupervisor(null);
          console.log("Pitch submitted to:", selectedSupervisor.name);
        }}
      />
    );
  }

  // 2. Render the DETAILS page of an existing pitch
  if (viewingPitchId) {
    const supervisor = supervisors.find(s => s.id === viewingPitchId);
    
    // Mocking the data that would normally come from your database
    const mockPitchData = {
      supervisorName: supervisor.name,
      projectTitle: "Smart Highway Enforcement System",
      projectPitch: "Currently, traffic law enforcement on major Kenyan highways relies heavily on manual policing, which is resource-intensive and prone to human error. This project proposes a Smart Highway Enforcement System utilizing computer vision to automate the detection of speeding vehicles. The system will process video feeds, capture license plates of violating vehicles via Optical Character Recognition (OCR), and log the data into a centralized web dashboard built with React and Flask. This solution aims to improve road safety and provide traffic authorities with an efficient, automated tracking mechanism."
    };

    return (
      <>
        {/* The modal is rendered on top of the details page when triggered */}
        <WithdrawModal 
          isOpen={withdrawModalId !== null} 
          onClose={() => setWithdrawModalId(null)} 
          onConfirm={handleConfirmWithdraw} 
        />
        
        <PendingPitchDetails
          pitchData={mockPitchData}
          onBack={() => setViewingPitchId(null)} // Go back to grid
          onWithdrawClick={() => setWithdrawModalId(viewingPitchId)} // Trigger Modal
        />
      </>
    );
  }

  // 3. Render the MAIN GRID
  const filtered = supervisors.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesInterest = interest === "All Interests" || s.interests.includes(interest);
    return matchesSearch && matchesInterest;
  });

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pt-2 pb-8 relative z-0">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2" style={{ color: BRAND }}>
        Dashboard: Supervisor Selection
      </h2>

      <div className="flex items-center gap-3 px-5 py-4 rounded-xl text-white text-sm font-medium shadow-sm" style={{ backgroundColor: BRAND }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        You do not have a Supervisor at the moment. Please browse the available supervisors below and submit a project pitch.
      </div>

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
            <FiChevronDown size={18} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-full min-w-[200px] overflow-hidden">
              {ALL_INTERESTS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setInterest(opt); setDropdownOpen(false); setPage(1); }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-indigo-50 ${interest === opt ? "font-bold text-blue-700 bg-blue-50/50" : "text-gray-700"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <p className="font-bold text-lg" style={{ color: BRAND }}>
          Available Supervisors
        </p>
        <p className="font-semibold text-sm bg-blue-50 px-3 py-1.5 rounded-lg border" style={{ color: BRAND, borderColor: `${BRAND}40` }}>
          Pitches Remaining: {pitchesLeft}/{maxPitches}
        </p>
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg font-medium">No supervisors found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((s) => (
            <SupervisorCard
              key={s.id}
              supervisor={s}
              pitchesLeft={pitchesLeft}
              onPitch={setSelectedSupervisor}
              isPitched={pitchedSupervisors.includes(s.id)}
              onViewPitch={setViewingPitchId} // Pass the view handler
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm font-semibold mt-6 mb-4" style={{ color: BRAND }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 hover:bg-blue-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
            &laquo; Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${page === p ? "text-white font-bold" : "hover:bg-blue-50"}`}
                style={page === p ? { backgroundColor: BRAND } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 hover:bg-blue-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
            Next &raquo;
          </button>
        </div>
      )}

    </div>
  );
};

export default SupervisorSelection;