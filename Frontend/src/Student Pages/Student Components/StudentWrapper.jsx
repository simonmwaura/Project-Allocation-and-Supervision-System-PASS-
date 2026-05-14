import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentOnboarding from "../StudentOnboarding";
import StudentLayout from "./StudentLayout";

const StudentWrapper = () => {
  const navigate = useNavigate();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const res = await fetch("http://127.0.0.1:5000/api/students/onboarding-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setOnboardingComplete(data.onboarding_complete);
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, [navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-[#302AE2] font-bold animate-pulse">
      Loading...
    </div>
  );

  // If not complete, show the onboarding screen
  if (!onboardingComplete) return (
    <StudentOnboarding onComplete={() => setOnboardingComplete(true)} />
  );

  // If complete, show your normal layout with the sidebar and toast container
  return <StudentLayout />;
};

export default StudentWrapper;