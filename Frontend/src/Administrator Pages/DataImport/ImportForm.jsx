import React, { useState, useRef } from 'react';
import { FiPlus, FiChevronDown, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

const BRAND = "#2b20d6";

export default function ImportForm({ refreshLogs }) {
  const [target, setTarget] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a valid .csv file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!target) return toast.warning("Please select a Data Target.");
    if (!file) return toast.warning("Please select a CSV file to upload.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_type", target);

    try {
      const token = localStorage.getItem("token");
      // Replace with your actual Flask POST route handling CSV uploads
      const response = await fetch("http://127.0.0.1:5000/api/admin/upload-csv", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // Note: Don't set Content-Type to application/json for FormData!
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("File uploaded and processed successfully!");
        setFile(null);
        setTarget("");
        refreshLogs(); // Update the history table below
      } else {
        toast.error(data.message || "Failed to process file.");
      }
    } catch (error) {
      toast.error("Network error during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-2xl p-6 lg:p-10 flex flex-col shadow-sm mb-12" style={{ borderColor: BRAND }}>
      <h3 className="font-extrabold text-center mb-6 text-xl" style={{ color: BRAND }}>
        Import Data
      </h3>
      
      <div className="flex flex-col gap-6">
        <div>
          <label className="text-xs font-bold text-gray-400 mb-1.5 ml-1 block">Select Data Target</label>
          <div className="relative">
            <FiFileText className="absolute left-4 top-3.5 text-gray-400 z-10" size={18} />
            <select 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-200 text-gray-700 rounded-xl py-3 pl-11 pr-10 focus:outline-none focus:ring-2 font-medium appearance-none cursor-pointer"
              style={{ focusRing: BRAND }}
            >
              <option value="" disabled>Select Data Target</option>
              {/* These match your Flask Enum exactly */}
              <option value="Supervisors_CSV">Supervisors CSV</option>
              <option value="2nd Year CSV">2nd Year Students CSV</option>
              <option value="4th Year CSV">4th Year Students CSV</option>
            </select>
            <FiChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Drag and Drop Zone / File Input */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed rounded-2xl py-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ borderColor: "rgba(43, 32, 214, 0.3)" }}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-xl border-2 flex items-center justify-center mb-4 text-gray-400" style={{ borderColor: "rgba(43, 32, 214, 0.5)" }}>
            <FiPlus size={32} />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {file ? <span className="text-[#2b20d6] font-bold">{file.name}</span> : "Drag and drop your .CSV file here, or click to browse."}
          </p>
        </div>

        <div className="flex justify-center mt-2">
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full max-w-[250px] py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:bg-blue-300"
            style={{ backgroundColor: BRAND }}
          >
            {isUploading ? "Processing..." : "Upload & Process"}
          </button>
        </div>
      </div>
    </div>
  );
}