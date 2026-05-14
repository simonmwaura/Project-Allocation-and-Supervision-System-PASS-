import { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
const BRAND = "#302AE2";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => { /* ... Keep your existing handleUpdate logic ... */ };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col h-full justify-between">
      <div className="w-full">
        <h3 className="text-lg font-bold mb-6 text-center" style={{ color: BRAND }}>Change Password</h3>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-gray-400" size={18} />
            <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
            <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 text-gray-400"><FiEye size={18}/></button>
          </div>
          
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-gray-400" size={18} />
            <input type={showConf ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm Password" className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
            <button onClick={() => setShowConf(!showConf)} className="absolute right-3.5 text-gray-400"><FiEye size={18}/></button>
          </div>
        </div>
      </div>

      <button onClick={handleUpdate} disabled={isSubmitting} className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md" style={{ backgroundColor: BRAND }}>
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
};
export default ChangePassword;