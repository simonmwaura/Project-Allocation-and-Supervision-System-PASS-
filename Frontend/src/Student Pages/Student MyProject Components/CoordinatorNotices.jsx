import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const BRAND = "#302AE2";

const notices = [
  {
    id: 1,
    author: "Dr Almaz - Project Coordinator",
    date: "Mar 4",
    subject: "URGENT: Milestone 1 Formatting Requirements",
    body: "Hello all, Please ensure your Milestone 1 proposals are submitted strictly in PDF format. Do not upload raw code files to the repository at this stage. Any submissions not in PDF format will be returned unread. Regards, Dr. Almaz",
  },
  {
    id: 2,
    author: "Dr Almaz - Project Coordinator",
    date: "Mar 10",
    subject: "Milestone 2 Deadline Reminder",
    body: "Dear students, This is a reminder that Milestone 2 submissions are due by March 20th. Please ensure your literature review is complete and formatted according to the guidelines. Regards, Dr. Almaz",
  },
];

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
    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
  </div>
);

const CoordinatorNotices = () => {
  const navigate = useNavigate();

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
        {notices.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No notices at the moment.</p>
        ) : (
          notices.map((notice) => (
            <NoticeCard key={notice.id} {...notice} />
          ))
        )}
      </div>

    </div>
  );
};

export default CoordinatorNotices;