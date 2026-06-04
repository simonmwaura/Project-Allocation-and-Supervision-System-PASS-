import React, { useState, useEffect } from "react";
import { FiUser, FiSave, FiEye, FiEyeOff, FiLock, FiMail, FiPhone } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

export default function AdministratorProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "Administrator",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // --- Fetch Profile Data ---
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.data) {
        setProfile({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phoneNumber: data.data.phoneNumber || "",
          role: data.data.role || "Administrator",
        });
      } else {
        toast.error(data.message || "Failed to load profile.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Update Profile Details ---
  const handleUpdateProfile = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      return toast.warning("Name and Email fields are required.");
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        fetchProfile(); // Refresh to catch any backend formatting
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Update Password ---
  const handleUpdatePassword = async () => {
    if (!passwords.newPassword || !passwords.confirmPassword) {
      return toast.warning("Please fill in both password fields.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (passwords.newPassword.length < 8) {
      return toast.warning("Password must be at least 8 characters long.");
    }

    setIsSavingPass(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/users/password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_password: passwords.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSavingPass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse h-full">
        <FiUser size={64} className="text-indigo-200 mb-4" />
        <p className="text-xl font-black text-indigo-300">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-10 px-4">
      <div className="w-full max-w-5xl mx-auto mt-6">
        <h2 className="text-3xl font-extrabold text-center mb-8" style={{ color: BRAND }}>
          Administrator Profile
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ─── LEFT CARD: PROFILE INFO ────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border-2 border-[#eef0fb] p-8 shadow-sm flex flex-col relative">
            {/* Avatar & Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center mb-4 bg-indigo-50" style={{ borderColor: BRAND }}>
                <FiUser size={40} style={{ color: BRAND }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                {profile.role}
              </p>
            </div>

            <div className="w-full border-t border-dashed border-gray-200 mb-6"></div>

            <div className="w-full space-y-4">
              {/* Names Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail size={18} />
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiPhone size={18} />
                  </div>
                  <input
                    type="text"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    placeholder="+254..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="w-full mt-4 h-12 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {isSavingProfile ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          </div>

          {/* ─── RIGHT CARD: SECURITY ───────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border-2 border-[#eef0fb] p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-6" style={{ color: BRAND }}>
              Security & Access
            </h3>

            <div className="space-y-5 flex-1">
              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2b20d6] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-[#eef0fb] text-gray-700 font-medium focus:border-[#2b20d6] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={isSavingPass}
              className="w-full mt-8 h-12 rounded-xl font-bold text-[#2b20d6] border-2 border-[#2b20d6] hover:bg-[#2b20d6] hover:text-white transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              {isSavingPass ? "Updating..." : "Change Password"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}