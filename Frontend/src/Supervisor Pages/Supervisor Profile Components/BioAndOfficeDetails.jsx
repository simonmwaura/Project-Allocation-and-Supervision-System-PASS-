import { useState, useEffect } from "react";
import { FiMapPin, FiClock, FiEdit3 } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const BioAndOfficeDetails = ({ bio, location, hours, preference, refreshData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: bio || "",
    location: location || "",
    hours: hours || "",
    preference: preference || ""
  });

  // Only update local state from props if we are NOT currently editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({ 
        bio: bio || "", 
        location: location || "", 
        hours: hours || "",
        preference: preference || ""
      });
    }
  }, [bio, location, hours, preference, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/supervisors/me/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bio: formData.bio,
          office_location: formData.location, // Matches backend
          office_hours: formData.hours,       // Matches backend
          supervision_preference: formData.preference
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        if (refreshData) refreshData();
      } else {
        toast.error("Failed to save changes.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col h-full justify-between">
      <div className="w-full">
        <h3 className="text-lg font-bold mb-5 text-center" style={{ color: BRAND }}>
          Bio & Office Details
        </h3>
        
        {!isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm">
              <FiMapPin className="text-gray-400" />
              <p><span className="font-bold">Location:</span> {location || "Not set"}</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm">
              <FiClock className="text-gray-400" />
              <p><span className="font-bold">Hours:</span> {hours || "Not set"}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 font-medium max-h-24 overflow-y-auto">
              {bio || "No bio provided."}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              name="location" // Must match formData key
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Location"
              className="w-full px-3 py-2 bg-white rounded-lg border-2 text-sm" 
              style={{ borderColor: BRAND }} 
            />
            <input 
              type="text" 
              name="hours" // Must match formData key
              value={formData.hours} 
              onChange={handleChange} 
              placeholder="Office Hours"
              className="w-full px-3 py-2 bg-white rounded-lg border-2 text-sm" 
              style={{ borderColor: BRAND }} 
            />
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder="Bio"
              className="w-full px-3 py-2 bg-white rounded-lg border-2 text-sm resize-none" 
              style={{ borderColor: BRAND }} 
              rows="3"
            />
          </div>
        )}
      </div>

      <button 
        onClick={isEditing ? handleUpdate : () => setIsEditing(true)} 
        disabled={isSaving}
        className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 mt-4 shadow-md"
        style={{ backgroundColor: BRAND }}
      >
        {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
      </button>
    </div>
  );
};

export default BioAndOfficeDetails;