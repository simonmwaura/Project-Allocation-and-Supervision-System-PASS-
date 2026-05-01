import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify'; // <-- ADDED TOAST

const BRAND = "#2b20d6";

const FacultyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const facultyMember = location.state?.facultyData;

  // --- STATES ---
  const [isSaving, setIsSaving] = useState(false); // Controls the Save button
  const [formData, setFormData] = useState({
    name: facultyMember?.name || '',
    email: 'placeholder@uonbi.ac.ke', 
    phone: '+254 700 000 000'         
  });

  if (!facultyMember) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 font-bold mb-4">Faculty details not found in memory.</p>
        <button 
          onClick={() => navigate('/administrator/managefaculty')}
          className="bg-[#2b20d6] text-white px-6 py-2 rounded-lg font-bold shadow-md"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const renderStatus = (status) => {
    if (status === "Active") return <span className="px-5 py-1 rounded-full border border-green-500 text-green-600 bg-green-50 text-xs font-extrabold tracking-wide">Active</span>;
    if (status === "Pending") return <span className="px-5 py-1 rounded-full border border-yellow-400 text-yellow-600 bg-yellow-50 text-xs font-extrabold tracking-wide">Pending</span>;
    return <span className="px-5 py-1 rounded-full border border-red-500 text-red-600 bg-red-50 text-xs font-extrabold tracking-wide">{status}</span>;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- THE WORKHORSE: SAVE FACULTY CHANGES ---
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://127.0.0.1:5000/api/users/update/${facultyMember.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Faculty details updated successfully!");
      } else {
        toast.error(data.message || "Failed to update details.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* --- HEADER --- */}
      <div className="relative flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/administrator/managefaculty')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity z-10"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={20} strokeWidth={3} />
          Back to supervisors
        </button>

        <div className="absolute left-0 right-0 text-center pointer-events-none">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: BRAND }}>
            Supervisor Details
          </h2>
        </div>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN (Profile & Security) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center mb-4" style={{ backgroundColor: BRAND }}>
              <FiUser size={50} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{facultyMember.name}</h3>
            {renderStatus(facultyMember.status)}
            <hr className="w-full border-dashed border-gray-300 my-6" />
            <div className="w-full flex flex-col gap-2 text-sm">
              <p><span className="font-extrabold text-gray-900">Role :</span> <span className="text-gray-600 font-medium">{facultyMember.role}</span></p>
              <p><span className="font-extrabold text-gray-900">Phone Number :</span> <span className="text-gray-600 font-medium">{formData.phone}</span></p>
              <p><span className="font-extrabold text-gray-900">Email :</span> <span className="text-gray-600 font-medium">{formData.email}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
            <h3 className="text-lg font-bold mb-2" style={{ color: BRAND }}>Security & Access</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Send a secure password reset link to the user's email address.
            </p>
            <div className="flex justify-end">
              <button 
                className="px-5 py-2.5 rounded-xl font-bold border-2 bg-white transition-colors hover:bg-blue-50"
                style={{ borderColor: BRAND, color: BRAND }}
              >
                Send Password Reset
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Edit Form & Suspend) */}
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
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 ml-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2b20d6] font-medium" />
                </div>
              </div>

              <div className="flex items-end">
                {/* --- WIRED SAVE BUTTON --- */}
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:bg-blue-300 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isSaving ? "" : BRAND }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-red-500">
            <h3 className="text-lg font-bold text-red-600 mb-2">Suspend Account</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <p className="text-sm text-gray-600 font-medium leading-relaxed md:w-2/3">
                Suspending this account will immediately revoke the supervisor's login access. Their project data will remain in the database, but they will not be able to interact with the system.
              </p>
              <button className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md whitespace-nowrap">
                Suspend Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;