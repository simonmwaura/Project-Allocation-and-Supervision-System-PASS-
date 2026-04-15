import React, { useState } from "react"; // Added useState
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiHash,
  FiChevronDown
} from "react-icons/fi";
import SuspendAccountModal from "./SuspendAccountModal"; // <-- Import the modal

const BRAND = "#2b20d6";

// ... [Keep your existing StatusBadge component here] ...
const StatusBadge = ({ status }) => {
  if (status === "Active") {
    return <span className="px-4 py-1 rounded-full border border-green-500 text-green-600 bg-green-50 text-xs font-bold w-24 inline-block text-center whitespace-nowrap">Active</span>;
  }
  if (status === "Pending") {
    return <span className="px-4 py-1 rounded-full border border-yellow-400 text-gray-800 bg-yellow-50 text-xs font-bold w-24 inline-block text-center whitespace-nowrap">Pending</span>;
  }
  if (status === "Suspended") {
    return <span className="px-4 py-1 rounded-full border border-red-500 text-red-600 bg-red-50 text-xs font-bold w-24 inline-block text-center whitespace-nowrap">Suspended</span>;
  }
  return null;
};

const StudentAccountDetails = ({ student, onBack }) => {
  // --- ADD STATE FOR MODAL ---
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const phone = student.phone || "+254734145632";
  const email = student.email || "simonmwaura@students.uonbi.ac.ke";

  // Function to handle the actual suspension logic
  const handleSuspendConfirm = (reason) => {
    console.log(`Suspending ${student.name} because: ${reason}`);
    setIsSuspendModalOpen(false); // Close the modal
    // TODO: Add your API call here to update the database
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* --- DROP THE MODAL HERE --- */}
      <SuspendAccountModal 
        isOpen={isSuspendModalOpen} 
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleSuspendConfirm}
        studentName={student.name}
      />

      {/* Header Area */}
      <div className="w-full flex items-center justify-center relative mb-8">
        <button
          onClick={onBack}
          className="absolute left-0 flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Back to students</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center" style={{ color: BRAND }}>
          Student Details
        </h2>
      </div>

      {/* Main Layout: Two Columns on Desktop */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col gap-6 w-full lg:w-[350px] flex-shrink-0">
          
          {/* Profile Card */}
          <div className="bg-white border-[1.5px] rounded-2xl p-6 flex flex-col items-center shadow-sm" style={{ borderColor: BRAND }}>
            {/* ... Profile Card content remains exactly the same ... */}
            <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center text-white mb-4">
              <FiUser size={50} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-1">{student.name}</h3>
            <p className="text-sm font-bold text-gray-500 mb-3">{student.reg}</p>
            <StatusBadge status={student.status} />
            <div className="w-full border-t-[2px] border-dashed border-gray-300 my-6"></div>
            <div className="w-full flex flex-col gap-1.5 text-[13px] font-bold text-gray-900">
              <p>Year : <span className="font-semibold text-gray-600">{student.year}</span></p>
              <p>Phone Number : <span className="font-semibold text-gray-600">{phone}</span></p>
              <p className="truncate">Email : <span className="font-semibold text-blue-600">{email}</span></p>
            </div>
          </div>

          {/* Security & Access Card */}
          <div className="bg-white border-[1.5px] rounded-2xl p-6 flex flex-col shadow-sm" style={{ borderColor: BRAND }}>
            {/* ... Security content remains exactly the same ... */}
            <h4 className="font-bold text-[16px] mb-2" style={{ color: BRAND }}>Security & Access</h4>
            <p className="text-sm font-medium text-gray-600 mb-6">Send a secure password reset link to the user's email address.</p>
            <button className="self-end px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] hover:bg-blue-50 transition-colors" style={{ borderColor: BRAND, color: BRAND }}>Send Password Reset</button>
          </div>

        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="flex flex-col gap-6 flex-1 w-full">
          
          {/* Edit Account Details Form */}
          <div className="bg-white border-[1.5px] rounded-2xl p-6 md:p-8 flex flex-col shadow-sm" style={{ borderColor: BRAND }}>
             {/* ... Form content remains exactly the same ... */}
             <h4 className="font-bold text-lg text-center mb-6" style={{ color: BRAND }}>Edit Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-500">Full Name</label>
                <div className="flex items-center gap-3 border border-gray-400 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-blue-500 transition-colors">
                  <FiUser size={18} className="text-gray-500 flex-shrink-0" />
                  <input type="text" defaultValue={student.name} className="flex-1 text-sm text-gray-700 bg-transparent outline-none w-full" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center gap-3 border border-gray-400 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-blue-500 transition-colors">
                  <FiPhone size={18} className="text-gray-500 flex-shrink-0" />
                  <input type="text" defaultValue={phone} className="flex-1 text-sm text-gray-700 bg-transparent outline-none w-full" />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-500">Email Address</label>
                <div className="flex items-center gap-3 border border-gray-400 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-blue-500 transition-colors">
                  <FiMail size={18} className="text-gray-500 flex-shrink-0" />
                  <input type="email" defaultValue={email} className="flex-1 text-sm text-gray-700 bg-transparent outline-none w-full" />
                </div>
              </div>

              {/* Registration Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-500">Registration Number</label>
                <div className="flex items-center gap-3 border border-gray-400 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-blue-500 transition-colors">
                  <FiHash size={18} className="text-gray-500 flex-shrink-0" />
                  <input type="text" defaultValue={student.reg} className="flex-1 text-sm text-gray-700 bg-transparent outline-none w-full" />
                </div>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-500">Year</label>
                <div className="flex items-center gap-3 border border-gray-400 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-blue-500 transition-colors">
                  <FiHash size={18} className="text-gray-500 flex-shrink-0" />
                  <select defaultValue={student.year} className="flex-1 text-sm text-gray-700 bg-transparent outline-none w-full appearance-none cursor-pointer">
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                  <FiChevronDown size={18} className="text-gray-500 flex-shrink-0" />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex flex-col gap-1.5 justify-end">
                <button className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-sm hover:opacity-90 transition-opacity mt-[22px]" style={{ backgroundColor: BRAND }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Suspend Account Card */}
          <div className="bg-[#fffdfd] border-[1.5px] border-red-500 rounded-2xl p-6 flex flex-col shadow-sm">
            <h4 className="font-bold text-[16px] text-red-600 mb-2">Suspend Account</h4>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <p className="text-sm font-medium text-gray-600 flex-1 leading-relaxed">
                Suspending this account will immediately revoke the student's login access. Their project data will remain in the database, but they will not be able to interact with the system.
              </p>
              <button 
                // --- TRIGGER MODAL OPEN HERE ---
                onClick={() => setIsSuspendModalOpen(true)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors whitespace-nowrap"
              >
                Suspend Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentAccountDetails;