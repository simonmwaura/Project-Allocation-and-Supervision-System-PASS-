import { useState, useEffect } from "react";
import { FiUser, FiPhone, FiLock, FiEye, FiEyeOff, FiHash, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-3 mb-10">
    {Array.from({ length: total }).map((_, i) => {
      const step = i + 1;
      const isActive = step === current;
      const isDone = step < current;
      return (
        <div key={step} className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all"
            style={{
              backgroundColor: isActive || isDone ? BRAND : "transparent",
              borderColor: BRAND,
              color: isActive || isDone ? "white" : BRAND,
            }}
          >
            {isDone ? "✓" : step}
          </div>
          {step < total && (
            <div
              className="w-12 h-0.5 rounded-full"
              style={{ backgroundColor: isDone ? BRAND : "#d1d5db" }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Confirm Your Details ─────────────────────────────────────────────
const StepOne = ({ profile, phone, setPhone, onNext }) => {
  const validate = () => {
    if (!phone || phone.trim().length < 10)
      return toast.error("Please enter a valid phone number.");
    onNext();
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: BRAND }}>
          Confirm Your Details
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          These details were loaded from the university records. Add your phone number to continue.
        </p>
      </div>

      {/* Read-only fields from DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-500">First Name</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
            <FiUser size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">{profile.firstName}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-500">Last Name</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
            <FiUser size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">{profile.lastName}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-500">Email</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 overflow-hidden">
            <FiMail size={16} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 font-medium truncate">{profile.email}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-500">Registration Number</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
            <FiHash size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">{profile.registrationNumber}</span>
          </div>
        </div>
      </div>

      {/* Editable: phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold" style={{ color: BRAND }}>
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div
          className="flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white focus-within:ring-1 transition-all"
          style={{ borderColor: BRAND }}
        >
          <FiPhone size={18} style={{ color: BRAND }} />
          <input
            type="text"
            placeholder="+254 7XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>
      </div>

      <button
        onClick={validate}
        className="w-full mt-2 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
        style={{ backgroundColor: BRAND }}
      >
        Continue →
      </button>
    </div>
  );
};

// ─── Step 2: Set Password ─────────────────────────────────────────────────────
const StepTwo = ({ password, setPassword, confirm, setConfirm, onBack, onSubmit, isSubmitting }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!password || password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (password !== confirm)
      return toast.error("Passwords do not match.");
    onSubmit();
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: BRAND }}>
          Set Your Password
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          You'll use this password for future logins via the Staff & Admin login form.
        </p>
      </div>

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">New Password</label>
        <div className="relative flex items-center border-2 rounded-xl px-4 py-3 bg-white focus-within:ring-1 transition-all" style={{ borderColor: BRAND }}>
          <FiLock size={18} style={{ color: BRAND }} className="mr-3" />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 text-gray-400 hover:text-gray-600">
            {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
        <div className="relative flex items-center border-2 rounded-xl px-4 py-3 bg-white focus-within:ring-1 transition-all" style={{ borderColor: BRAND }}>
          <FiLock size={18} style={{ color: BRAND }} className="mr-3" />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-gray-400 hover:text-gray-600">
            {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={validate}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          {isSubmitting ? "Saving..." : "Complete Setup ✓"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentOnboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    registrationNumber: "",
  });
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Load existing details from DB on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:5000/api/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            firstName: data.data.first_name,
            lastName: data.data.last_name,
            email: data.data.email,
            registrationNumber: data.data.registration_number,
          });
        }
      } catch {
        toast.error("Could not load your profile. Please refresh.");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/students/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: phone, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome to PASS! Your account is ready.");
        if (onComplete) onComplete();
      } else {
        toast.error(data.message || "Setup failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Could not complete setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      <div
        className="w-full max-w-4xl border rounded-[2rem] p-4 md:p-12 flex items-center justify-center min-h-[85vh]"
        style={{ borderColor: BRAND }}
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-2xl p-8 md:p-12 flex flex-col items-center">

          {step === 1 && (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-center" style={{ color: BRAND }}>
                Welcome, {profile.firstName || "Student"}!
              </h1>
              <p className="text-gray-400 text-sm mb-8 text-center">
                Before you start, let's get your account set up. This only takes a moment.
              </p>
            </>
          )}

          <StepIndicator current={step} total={2} />

          {step === 1 && (
            <StepOne
              profile={profile}
              phone={phone}
              setPhone={setPhone}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepTwo
              password={password}
              setPassword={setPassword}
              confirm={confirm}
              setConfirm={setConfirm}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;