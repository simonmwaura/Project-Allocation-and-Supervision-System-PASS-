import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorLayout from "./SupervisorLayout";
import SupervisorInterestsSetup from "./SupervisorInterestsSetup";

// ─────────────────────────────────────────────────────────────────────────────
// SupervisorWrapper
//
// Guards the /supervisor/* route tree.
// ALLOWS: Supervisor role AND Coordinator role (a coordinator is also a supervisor).
// BLOCKS: everyone else → redirected to /.
//
// If the supervisor profile onboarding_complete = false → shows setup wizard.
// Otherwise → renders SupervisorLayout with the Outlet.
// ─────────────────────────────────────────────────────────────────────────────
const SupervisorWrapper = () => {
  const navigate = useNavigate();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [supervisorName, setSupervisorName]         = useState("");
  const [isLoading, setIsLoading]                   = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        // Both Supervisor and Coordinator roles are allowed here.
        // Coordinators have a Supervisor row (created by google_login auto-heal).
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!["Supervisor", "Coordinator"].includes(user.role)) {
          navigate("/");
          return;
        }

        const res = await fetch("http://127.0.0.1:5000/api/supervisors/onboarding-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setOnboardingComplete(data.onboarding_complete);
          setSupervisorName(user.first_name || "");
        } else {
          navigate("/");
        }
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

  if (!onboardingComplete) return (
    <SupervisorInterestsSetup
      supervisorName={supervisorName}
      onComplete={() => setOnboardingComplete(true)}
    />
  );

  return <SupervisorLayout />;
};

export default SupervisorWrapper;