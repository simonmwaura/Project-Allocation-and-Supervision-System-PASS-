import React, { useRef } from 'react';
import { FiUser, FiCamera, FiSave } from "react-icons/fi";

const StudentCard = ({ studentData, setStudentData, fullName }) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStudentData({ ...studentData, profilePicture: imageUrl });
    }
  };

  const handlePhoneChange = (e) => {
    setStudentData({ ...studentData, phoneNumber: e.target.value });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border-2 flex flex-col items-center text-center w-full" style={{ borderColor: "#302AE2" }}>
      
      <div 
        className="relative w-28 h-28 bg-[#eef0fb] rounded-full flex items-center justify-center border-2 mb-4 cursor-pointer group overflow-hidden" 
        style={{ borderColor: "#302AE2", color: "#302AE2" }}
        onClick={handleImageClick}
      >
        {studentData.profilePicture ? (
          <img src={studentData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <FiUser size={48} />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FiCamera size={28} className="text-white" />
        </div>
      </div>
      
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

      <h3 className="text-2xl font-bold text-gray-800">{fullName}</h3>
      <p className="text-sm text-gray-500 mb-6 font-medium">{studentData.registrationNumber}</p>

      <hr className="w-full border-t border-dashed border-gray-300 mb-6" />

      <div className="w-full flex flex-col space-y-4 text-sm text-left px-2">
        
        {/* CLOSER SPACING: Removed justify-between, added gap-3 and w-16 to label */}
        <div className="flex items-center w-full gap-3">
            <span className="font-semibold text-gray-700 w-16 shrink-0">Year:</span> 
            <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-md">{studentData.year}</span>
        </div>
        
        {/* CLOSER SPACING: Removed justify-between, added gap-3 and w-16 to label */}
        <div className="flex items-center w-full gap-3 overflow-hidden">
            <span className="font-semibold text-gray-700 w-16 shrink-0">Email:</span> 
            <span 
              className="font-medium bg-gray-100 px-3 py-1 rounded-md text-gray-600 truncate"
              title={studentData.email}
            >
              {studentData.email}
            </span>
        </div>

        <div className="flex flex-col space-y-2 pt-2">
            <label className="font-semibold text-gray-700">Phone Number (Editable):</label>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={studentData.phoneNumber} 
                    onChange={handlePhoneChange}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 min-w-0"
                    style={{ borderColor: "#302AE2", focusRingColor: "#302AE2" }}
                />
                <button 
                    className="px-4 py-2 text-white rounded-lg transition hover:opacity-90 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#302AE2" }}
                >
                    <FiSave size={18} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StudentCard;