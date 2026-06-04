import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const BRAND = "#302AE2";

const NoticeCard = ({ author, date, subject, body }) => (
  <div
    className="w-full bg-white rounded-2xl border-2 p-5 shadow-sm"
    style={{ borderColor: BRAND }}
  >
    {/* Header */}
    <div className="flex items-center gap-3 mb-3">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#e8eaf6", border: `2px solid ${BRAND}` }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={BRAND} strokeWidth="2" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={BRAND} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div>
        <p className="font-bold text-sm" style={{ color: BRAND }}>
          {author}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>

    {/* Subject */}
    <p className="font-bold text-sm text-gray-900 mb-1">{subject}</p>

    {/* Body */}
    <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{body}</p>
  </div>
);

const CoordinatorNotices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/students/broadcasts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setNotices(data.data);
        } else {
          setError(data.message || "Failed to load notices.");
        }
      } catch (err) {
        setError("Network error. Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [navigate]);

  return (
    <div className="w-full flex flex-col px-4 pt-6 pb-12">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/student/myproject")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} />
          Back to Project Workspace
        </button>
      </div>

      {/* Page Title */}
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND }}>
        Coordinator Notices
      </h2>

      {/* Notices List */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-[#302AE2] font-bold animate-pulse mt-20">
            Loading notices...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-20">{error}</div>
        ) : notices.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No notices at the moment.</p>
        ) : (
          notices.map((notice) => (
            <NoticeCard 
              key={notice.id} 
              author={notice.author}
              date={notice.date}
              subject={notice.title}  // Mapped from backend 'title'
              body={notice.message}   // Mapped from backend 'message'
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CoordinatorNotices;