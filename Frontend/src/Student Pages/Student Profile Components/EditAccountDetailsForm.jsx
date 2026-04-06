import React from 'react';
import { FiUser, FiPhone, FiMail, FiHash } from "react-icons/fi";

const EditAccountDetailsForm = ({ studentData, setStudentData, fullName }) => {
  
  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-6">
      <h3 className="text-xl font-bold" style={{ color: "#2b20d6" }}>Edit Account Details</h3>
      
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Full Name */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-500 font-medium">Full Name</label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3 text-gray-400" size={18} />
            <input type="text" value={fullName} disabled className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold" style={{ color: "#2b20d6" }}>Phone Number</label>
          <div className="relative flex items-center">
            <FiPhone className="absolute left-3" style={{ color: "#2b20d6" }} size={18} />
            <input 
              type="text" 
              name="phoneNumber" 
              value={studentData.phoneNumber} 
              onChange={handleGenericChange} 
              className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border-2 text-sm font-semibold focus:outline-none"
              style={{ borderColor: "#2b20d6", color: "#2b20d6" }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-500 font-medium">Email Address</label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-3 text-gray-400" size={18} />
            <input type="email" value={studentData.email} disabled className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none" />
          </div>
        </div>

        {/* Registration & Year Container */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-500 font-medium">Reg Number</label>
            <div className="relative flex items-center">
              <FiHash className="absolute left-3 text-gray-400" size={18} />
              <input type="text" value={studentData.registrationNumber} disabled className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-500 font-medium">Year</label>
            <div className="relative flex items-center">
              <FiHash className="absolute left-3 text-gray-400" size={18} />
              <select 
                name="year"
                value={studentData.year} 
                onChange={handleGenericChange}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-sm focus:outline-none appearance-none cursor-pointer"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Button */}
        <div className="md:col-span-2 flex justify-end mt-2">
          <button type="button" className="px-6 py-2.5 text-white rounded-lg font-medium text-sm transition hover:opacity-90 shadow-sm" style={{ backgroundColor: "#2b20d6" }}>
            Update Phone Number
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAccountDetailsForm;