import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CoordinatorLayout from "./CoordinatorLayout";

// ─────────────────────────────────────────────────────────────────────────────
// CoordinatorWrapper
//
// Guards the /coordinator/* route tree.
// ALLOWS: Coordinator role only.
// BLOCKS: Supervisors who are not coordinators → redirected to /.
//
// No onboarding wizard for coordinators — they set up their Supervisor profile
// during the SupervisorInterestsSetup flow.
// ─────────────────────────────────────────────────────────────────────────────
const CoordinatorWrapper = () => {
  const navigate  = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Only Coordinators may access this portal
        if (user.role !== "Coordinator") {
          navigate("/");
          return;
        }

        // Optionally validate the token is still live
        const res = await fetch("http://127.0.0.1:5000/api/coordinators/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { navigate("/"); return; }

      } catch {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, [navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-[#2b20d6] font-bold animate-pulse">
      Loading…
    </div>
  );

  return <CoordinatorLayout />;
};

export default CoordinatorWrapper;