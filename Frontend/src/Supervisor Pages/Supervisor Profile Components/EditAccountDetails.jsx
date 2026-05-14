import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const EditAccountDetails = ({ profileData, refreshData }) => {
  const [phone, setPhone] = useState(profileData.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);

  // --- FIX 1: This ensures the input box updates when the API finishes loading ---
  useEffect(() => {
    setPhone(profileData.phoneNumber || "");
  }, [profileData.phoneNumber]);

  // --- FIX 2: The actual fetch logic restored ---
  const handleUpdate = async () => {
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number.");
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/supervisors/me/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone_number: phone })
      });

      if (response.ok) {
        toast.success("Phone updated!");
        refreshData(); // Triggers the parent to re-fetch the latest data
      } else {
        toast.error("Failed to update phone.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col h-full justify-between">
      <div>
        <h3 className="text-xl font-bold mb-6" style={{ color: BRAND }}>Edit Account Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Read Only Fields */}
          <div className="flex flex-col space-y-5">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-gray-400" size={18} />
                <input type="text" value={profileData.fullName} disabled className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-gray-400" size={18} />
                <input type="text" value={profileData.email} disabled className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* Editable Phone Field */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: BRAND }}>Phone Number</label>
              <div className="relative flex items-center">
                <FiPhone className="absolute left-3.5" style={{ color: BRAND }} size={18} />
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white rounded-xl border-2 text-sm font-bold outline-none focus:border-blue-700 transition-colors" 
                  style={{ borderColor: BRAND, color: BRAND }} 
                />
              </div>
            </div>
            
            <button onClick={handleUpdate} disabled={isSaving} className="w-full mt-6 md:mt-0 py-3.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md disabled:opacity-50" style={{ backgroundColor: BRAND }}>
              {isSaving ? "Updating..." : "Update Phone Number"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccountDetails;