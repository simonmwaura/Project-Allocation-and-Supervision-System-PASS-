import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const ChangeStudentPassword = ({ passwordData, setPasswordData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border-2 flex flex-col space-y-6" style={{ borderColor: "#302AE2" }}>
      <h3 className="text-xl font-bold" style={{ color: "#302AE2" }}>Change Password</h3>
      
      {/* Explicitly flex-col so they stack one on top of the other */}
      <form className="flex flex-col space-y-6">
        
        {/* Your Password */}
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
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-400 hover:text-gray-600">
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
             <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-gray-400 hover:text-gray-600">
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        
        {/* Update Button */}
        <div className="pt-2">
          <button type="button" className="w-full py-3 text-white rounded-lg font-bold text-sm transition hover:opacity-90 shadow-sm" style={{ backgroundColor: "#302AE2" }}>
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeStudentPassword;