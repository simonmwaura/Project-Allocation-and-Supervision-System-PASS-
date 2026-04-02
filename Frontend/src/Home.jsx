import { useNavigate } from "react-router-dom";

const BRAND = "#2b20d6";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8" style={{ backgroundColor: "#eef0fb" }}>
      
      <div style={{ color: BRAND }}>
        <h1 className="text-6xl font-bold text-center tracking-wide">PASS</h1>
        <p className="text-center text-lg font-semibold mt-1">Project Allocation & Supervision System</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">

        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-10 py-6 rounded-2xl font-bold text-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Student
        </button>

        <button
          onClick={() => navigate("/supervisor/dashboard")}
          className="px-10 py-6 rounded-2xl font-bold text-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Supervisor
        </button>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-10 py-6 rounded-2xl font-bold text-lg transition-opacity hover:opacity-90 border-2"
          style={{ color: BRAND, borderColor: BRAND }}
        >
          Admin
        </button>

        <button
          onClick={() => navigate("/panel/dashboard")}
          className="px-10 py-6 rounded-2xl font-bold text-lg transition-opacity hover:opacity-90 border-2"
          style={{ color: BRAND, borderColor: BRAND }}
        >
          Panel Member
        </button>

      </div>
    </div>
  );
};

export default Home;