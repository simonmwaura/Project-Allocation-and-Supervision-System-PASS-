import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#302AE2";

const TECH_AREAS = [
  "Machine Learning", "Mobile App Development", "Computer Vision", 
  "Networking", "Web Development", "Cloud Computing", 
  "Software Engineering", "Embedded Systems", "Cybersecurity", 
  "Internet of Things (IoT)", "Natural Language Processing", 
  "Artificial Intelligence", "Data Science", "Game Development", 
  "Blockchain Technology", "Database Management",
];

const EditResearchInterests = () => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current interests when the page loads
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/supervisors/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setSelectedInterests(data.data.research_interests || []);
        }
      } catch (error) {
        toast.error("Failed to load current interests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterests();
  }, []);

  const toggleInterest = (area) => {
    if (selectedInterests.includes(area)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== area));
    } else {
      setSelectedInterests([...selectedInterests, area]);
    }
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      return toast.error("Please select at least one research area.");
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/supervisors/me/interests", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ interests: selectedInterests })
      });

      if (response.ok) {
        toast.success("Research interests updated successfully!");
        navigate("/supervisor/profile"); // Instantly send them back to the profile
      } else {
        toast.error("Failed to update interests.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Loading your interests...</div>;
  }

  return (
    <div className="w-full flex flex-col px-4 pt-4 pb-12 max-w-5xl mx-auto relative z-0">
      
      {/* Back Button matching your mockup */}
      <div className="mb-8 relative z-10">
        <button
          onClick={() => navigate("/supervisor/profile")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity shadow-md w-fit"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowLeft size={18} /> Back to My Profile
        </button>
      </div>

      {/* Main Editing Card */}
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border-2 p-8 md:p-12 shadow-sm relative z-10" style={{ borderColor: BRAND }}>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: BRAND }}>
            Edit Research Interests
          </h2>
          <p className="text-gray-400 font-medium text-[15px]">
            Update your primary areas of research so students know what kind of projects you supervise.
          </p>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
          {TECH_AREAS.map((area) => {
            const isSelected = selectedInterests.includes(area);
            return (
              <button
                key={area}
                onClick={() => toggleInterest(area)}
                className={`px-3 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-200 
                  ${isSelected 
                    ? 'text-white shadow-inner scale-95 border-transparent' 
                    : 'text-gray-600 bg-gray-400/20 hover:bg-gray-400/40 shadow-sm border border-transparent' 
                  }
                `}
                style={isSelected ? { backgroundColor: BRAND } : {}}
              >
                {area}
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-[60%] py-4 rounded-xl text-white font-bold text-[15px] hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default EditResearchInterests;