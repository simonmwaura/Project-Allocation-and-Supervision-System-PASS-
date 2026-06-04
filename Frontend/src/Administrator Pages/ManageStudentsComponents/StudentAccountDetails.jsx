import React, { useState } from "react";
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiHash,
  FiChevronDown
} from "react-icons/fi";
import SuspendAccountModal from "./SuspendAccountModal";
import UnsuspendAccountModal from "./UnsuspendAccountModal";
import DeleteAccountModal from "./DeleteAccountModal"; 
import { toast } from 'react-toastify';

const BRAND = "#2b20d6";

const StudentAccountDetails = ({ student, onBack }) => {
  const [status, setStatus] = useState(student?.status);
  const [suspensionReason, setSuspensionReason] = useState(student?.suspension_reason);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);         

  const [formData, setFormData] = useState({
    name: student?.name || '',
    phone: student?.phone || '+254 700 000 000',
    email: student?.email || 'placeholder@students.uonbi.ac.ke',
    reg: student?.reg || '',
    year: student?.year || '2'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderStatus = (status) => {
    if (status === "Active") return <span className="px-5 py-1 rounded-full border border-green-500 text-green-600 bg-green-50 text-xs font-extrabold tracking-wide">Active</span>;
    if (status === "Pending") return <span className="px-5 py-1 rounded-full border border-yellow-400 text-yellow-600 bg-yellow-50 text-xs font-extrabold tracking-wide">Pending</span>;
    return <span className="px-5 py-1 rounded-full border border-red-500 text-red-600 bg-red-50 text-xs font-extrabold tracking-wide">{status}</span>;
  };

  const handleSaveChanges = async () => { 
    // Your existing save logic
  };

  const handleSuspendConfirm = async (reason) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://127.0.0.1:5000/api/users/suspend/${student.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Account suspended.");
        setStatus("Suspended");
        setSuspensionReason(reason);
        setIsSuspendModalOpen(false);
      } else {
        toast.error(data.message || "Failed to suspend account.");
      }
    } catch (error) {
      toast.error("Connection error. Could not suspend account.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsuspendConfirm = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://127.0.0.1:5000/api/users/unsuspend/${student.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Access restored.");
        setStatus("Active");
        setSuspensionReason(null);
        setIsUnsuspendModalOpen(false);
      } else {
        toast.error(data.message || "Failed to restore access.");
      }
    } catch (error) {
      toast.error("Connection error. Could not restore access.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async (reason) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://127.0.0.1:5000/api/users/${student.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Account permanently deleted: ${formData.name}`); 
        setIsDeleteModalOpen(false);
        setTimeout(() => onBack(), 1500); 
      } else {
        toast.error(data.message || "Deletion failed.");
      }
    } catch (error) {
      toast.error("Connection error. Could not delete account.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-2">
      
      <SuspendAccountModal isOpen={isSuspendModalOpen} onClose={() => !isProcessing && setIsSuspendModalOpen(false)} onConfirm={handleSuspendConfirm} studentName={formData.name} />
      <UnsuspendAccountModal isOpen={isUnsuspendModalOpen} onClose={() => !isProcessing && setIsUnsuspendModalOpen(false)} onConfirm={handleUnsuspendConfirm} userName={formData.name} reason={suspensionReason} />
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => !isProcessing && setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} userName={formData.name} />

      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0">
        {/* Left: Back Button */}
        <div className="w-full sm:w-1/3 flex justify-start z-10">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND }}>
            <FiArrowLeft size={20} strokeWidth={3} />
            Back to students
          </button>
        </div>

        {/* Center: Title */}
        <div className="w-full sm:w-1/3 text-center pointer-events-none">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: BRAND }}>Student Details</h2>
        </div>

        {/* Right: Invisible Spacer (Ensures the title stays perfectly centered) */}
        <div className="w-full sm:w-1/3 hidden sm:block"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center mb-4" style={{ backgroundColor: BRAND }}>
              <FiUser size={50} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2 text-center">{formData.name}</h3>
            {renderStatus(status)}
            <hr className="w-full border-dashed border-gray-300 my-6" />
            <div className="w-full flex flex-col gap-2 text-sm">
              <p><span className="font-extrabold text-gray-900">Reg No :</span> <span className="text-gray-600 font-medium">{formData.reg}</span></p>
              <p><span className="font-extrabold text-gray-900">Year :</span> <span className="text-gray-600 font-medium">{formData.year}</span></p>
              <p><span className="font-extrabold text-gray-900">Phone :</span> <span className="text-gray-600 font-medium">{formData.phone}</span></p>
              <p className="truncate"><span className="font-extrabold text-gray-900">Email :</span> <span className="text-blue-600 font-medium">{formData.email}</span></p>
            </div>
          </div>

          <div className="bg-[#fffdfd] rounded-2xl p-6 shadow-sm border border-red-500">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Permanently delete this user from the database. This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white transition-colors hover:bg-red-700 shadow-md text-center" 
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-blue-200">
            <h3 className="text-xl font-bold mb-8 text-center" style={{ color: BRAND }}>Edit Account Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Registration Number</label>
                <div className="relative">
                  <FiHash className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" name="reg" value={formData.reg} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Academic Year</label>
                <div className="relative">
                  <FiHash className="absolute left-4 top-3.5 text-gray-400 z-10" size={18} />
                  <select name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium appearance-none cursor-pointer relative">
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: isSaving ? "" : BRAND }}
                >
                  {isSaving ? "Saving to Database..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>

          {status === "Suspended" ? (
            <div className="bg-[#fffdfd] rounded-2xl p-6 md:p-8 shadow-sm border border-yellow-500">
              <h3 className="text-lg font-bold text-yellow-600 mb-2">Account is Suspended</h3>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-4">
                <p className="text-sm font-bold text-yellow-800 mb-1">Reason for suspension:</p>
                <p className="text-sm text-yellow-700 italic">"{suspensionReason || "No reason recorded."}"</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between mt-4">
                <p className="text-sm text-gray-600 font-medium leading-relaxed md:w-2/3">
                  This user currently cannot access the system. You can restore their access by unsuspending their account.
                </p>
                <button 
                  onClick={() => setIsUnsuspendModalOpen(true)}
                  className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md whitespace-nowrap"
                >
                  Restore Access
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#fffdfd] rounded-2xl p-6 md:p-8 shadow-sm border border-red-500">
              <h3 className="text-lg font-bold text-red-600 mb-2">Suspend Account</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <p className="text-sm text-gray-600 font-medium leading-relaxed md:w-2/3">
                  Suspending this account will immediately revoke the student's login access. Their project data will remain in the database, but they will not be able to interact with the system.
                </p>
                <button 
                  onClick={() => setIsSuspendModalOpen(true)}
                  className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md whitespace-nowrap"
                >
                  Suspend Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentAccountDetails;