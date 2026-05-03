import { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const ChangeStudentPassword = ({ passwordData, setPasswordData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdatePassword = async () => {
    const { password, confirmPassword } = passwordData;

    // Client-side validation before hitting the server
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/students/me/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!");
        // Clear the fields after a successful update
        setPasswordData({ password: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch {
      toast.error("Network error. Could not update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white p-8 rounded-2xl shadow-sm border-2 flex flex-col space-y-6"
      style={{ borderColor: BRAND }}
    >
      <h3 className="text-xl font-bold" style={{ color: BRAND }}>
        Change Password
      </h3>

      <form className="flex flex-col space-y-6">

        {/* New Password */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">New Password</label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={passwordData.password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#302AE2] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3 text-gray-400" size={18} />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#302AE2] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Update Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={isSubmitting}
            className="w-full py-3 text-white rounded-lg font-bold text-sm transition hover:opacity-90 shadow-sm disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ChangeStudentPassword;