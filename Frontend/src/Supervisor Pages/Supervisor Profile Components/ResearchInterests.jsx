import { useNavigate } from "react-router-dom";

const BRAND = "#302AE2";

const ResearchInterests = ({ interests }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col h-full justify-between items-center text-center">
      <div className="w-full">
        <h3 className="text-lg font-bold mb-6" style={{ color: BRAND }}>My Research Interests</h3>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {interests && interests.length > 0 ? (
            interests.map((interest, idx) => (
              <span key={idx} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full">
                {interest}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No interests added yet.</span>
          )}
        </div>
      </div>
      <button 
        onClick={() => navigate("/supervisor/edit-interests")} 
        className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md" 
        style={{ backgroundColor: BRAND }}
      >
        Edit Interests
      </button>
    </div>
  );
};

export default ResearchInterests;