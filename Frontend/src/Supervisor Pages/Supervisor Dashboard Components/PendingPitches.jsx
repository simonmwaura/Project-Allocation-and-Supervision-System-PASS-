import { useState, useEffect } from "react";
import { FiInfo, FiSearch, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import PitchCard from "./PitchCard";
import PitchReviewDetails from "./PitchReviewDetails";
import AcceptPitchModal from "./AcceptPitchModal";
import DeclinePitchModal from "./DeclinePitchModal";

const BRAND = "#2b20d6";
const CARDS_PER_PAGE = 6;

const PendingPitches = () => {
  const [pitches, setPitches] = useState([]);
  const [capacity, setCapacity] = useState({ year2: { filled: 0, total: 0 }, year4: { filled: 0, total: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const [activeTab, setActiveTab] = useState("4th");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [viewingPitch, setViewingPitch] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [pitchRes, capRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/supervisors/pending-pitches", { headers }),
        fetch("http://127.0.0.1:5000/api/supervisors/capacity", { headers }),
      ]);

      const pitchData = await pitchRes.json();
      const capData = await capRes.json();

      if (pitchRes.ok) setPitches(pitchData.data || []);
      else toast.error(pitchData.message || "Could not load pitches.");

      if (capRes.ok) setCapacity(capData.data);
    } catch {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const yearFilter = activeTab === "4th" ? "4" : "2";
  const currentCap = activeTab === "4th" ? capacity.year4 : capacity.year2;

  const filtered = pitches
    .filter((p) => String(p.year) === yearFilter)
    .filter((p) =>
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => sortOrder === "newest" ? b.pitchId - a.pitchId : a.pitchId - b.pitchId);

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const handleApproveConfirm = async () => {
    if (!acceptTarget) return;
    setIsActioning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:5000/api/supervisors/pitch/${acceptTarget.pitchId}/approve`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Pitch accepted! Student has been assigned to you.");
        setAcceptTarget(null);
        setViewingPitch(null);
        fetchData();
      } else {
        toast.error(data.message || "Failed to accept pitch.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeclineConfirm = async (reason) => {
    if (!declineTarget) return;
    setIsActioning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:5000/api/supervisors/pitch/${declineTarget.pitchId}/decline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ decline_reason: reason }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Pitch declined.");
        setDeclineTarget(null);
        setViewingPitch(null);
        fetchData();
      } else {
        toast.error(data.message || "Failed to decline pitch.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsActioning(false);
    }
  };

  // ── Detail view ──────────────────────────────────────────────────────────
  if (viewingPitch) {
    return (
      <>
        <PitchReviewDetails
          pitch={viewingPitch}
          onBack={() => setViewingPitch(null)}
          onAccept={() => setAcceptTarget(viewingPitch)}
          onDecline={() => setDeclineTarget(viewingPitch)}
        />
        <AcceptPitchModal
          isOpen={!!acceptTarget}
          onClose={() => setAcceptTarget(null)}
          onConfirm={handleApproveConfirm}
          studentName={acceptTarget?.studentName}
          totalSlots={currentCap.total}
          year={activeTab}
          isSubmitting={isActioning}
        />
        <DeclinePitchModal
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          onConfirm={handleDeclineConfirm}
          studentName={declineTarget?.studentName}
          isSubmitting={isActioning}
        />
      </>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col items-center px-4 pt-8 pb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6" style={{ color: BRAND }}>
        Dashboard: Pending Pitches
      </h2>

      <div className="w-full max-w-5xl flex flex-col gap-6">

        {/* Info Banner */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm md:text-[15px] font-medium shadow-sm"
          style={{ backgroundColor: BRAND }}
        >
          <FiInfo size={22} className="flex-shrink-0" />
          <p>Review your pending project pitches below. Accept or decline students based on your capacity.</p>
        </div>

        {/* Search + Sort */}
        <div
          className="flex flex-col sm:flex-row items-stretch border-[1.5px] rounded-xl bg-white overflow-visible relative"
          style={{ borderColor: BRAND }}
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:border-r-[1.5px]" style={{ borderColor: BRAND }}>
            <FiSearch size={20} style={{ color: BRAND }} />
            <input
              type="text"
              placeholder="Search by student name or project"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="flex-1 text-[15px] text-gray-700 outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-between sm:justify-center gap-3 px-4 py-3 bg-white text-[15px] font-medium min-w-[200px] w-full"
              style={{ color: BRAND }}
            >
              <span>Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
              <FiChevronDown size={18} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-full overflow-hidden">
                {[["newest", "Newest First"], ["oldest", "Oldest First"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setSortOrder(val); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors ${sortOrder === val ? "font-bold" : ""}`}
                    style={{ color: BRAND }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Year Tabs */}
        <div className="flex w-full border-[1.5px] rounded-full overflow-hidden" style={{ borderColor: BRAND }}>
          {["4th", "2nd"].map((yr) => (
            <button
              key={yr}
              onClick={() => { setActiveTab(yr); setPage(1); }}
              className="flex-1 py-3 text-[15px] font-bold transition-colors"
              style={{
                backgroundColor: activeTab === yr ? BRAND : "transparent",
                color: activeTab === yr ? "#fff" : BRAND,
              }}
            >
              {yr} Year Pitches
            </button>
          ))}
        </div>

        {/* Live Capacity */}
        <p className="text-center font-semibold text-lg" style={{ color: BRAND }}>
          Capacity: {currentCap.filled} / {currentCap.total} Accepted
        </p>

        {/* Cards */}
        {isLoading ? (
          <p className="text-center font-bold animate-pulse mt-8" style={{ color: BRAND }}>Loading pitches...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center text-gray-400 mt-12 font-medium">
            No pending {activeTab}-year pitches{searchQuery ? " matching your search" : ""}.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {paginated.map((pitch) => (
              <PitchCard
                key={pitch.pitchId}
                studentName={pitch.studentName}
                regNumber={pitch.registrationNumber}
                projectTitle={pitch.projectTitle}
                year={pitch.year}
                onReview={() => setViewingPitch(pitch)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 font-semibold text-[15px]" style={{ color: BRAND }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 hover:underline disabled:opacity-40">
              &lt;&lt; previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="px-3 py-1 rounded-lg transition-colors"
                style={page === i + 1 ? { backgroundColor: BRAND, color: "white", fontWeight: "bold" } : {}}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 hover:underline disabled:opacity-40">
              next &gt;&gt;
            </button>
          </div>
        )}
      </div>

      {/* Grid-level modals */}
      <AcceptPitchModal
        isOpen={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        onConfirm={handleApproveConfirm}
        studentName={acceptTarget?.studentName}
        totalSlots={currentCap.total}
        year={activeTab}
        isSubmitting={isActioning}
      />
      <DeclinePitchModal
        isOpen={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        onConfirm={handleDeclineConfirm}
        studentName={declineTarget?.studentName}
        isSubmitting={isActioning}
      />
    </div>
  );
};

export default PendingPitches;