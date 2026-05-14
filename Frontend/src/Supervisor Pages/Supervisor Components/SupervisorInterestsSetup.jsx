import React, { useState } from "react";
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

const SupervisorInterestsSetup = ({ supervisorName = "Supervisor", onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state variables for the Supervisor model fields
  const [formData, setFormData] = useState({
    year2Capacity: 5,
    year4Capacity: 5,
    officeLocation: "",
    officeHours: "",
    bio: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (area) => {
    if (selectedInterests.includes(area)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== area));
    } else {
      setSelectedInterests([...selectedInterests, area]);
    }
  };

  const handleConfirm = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one area of interest.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        interests: selectedInterests,
        max_2nd_year_capacity: parseInt(formData.year2Capacity),
        max_4th_year_capacity: parseInt(formData.year4Capacity),
        office_location: formData.officeLocation,
        office_hours: formData.officeHours,
        bio: formData.bio
      };

      const response = await fetch("http://127.0.0.1:5000/api/supervisors/complete-onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile setup complete!");
        if (onComplete) onComplete();
      } else {
        toast.error(data.message || "Failed to save profile details.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      <div 
        className="w-full max-w-7xl border rounded-[2rem] p-4 md:p-8 flex items-center justify-center bg-transparent"
        style={{ borderColor: BRAND }}
      >
        <div className="bg-white rounded-2xl shadow-lg w-full p-8 md:p-10 flex flex-col">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: BRAND }}>
              Welcome, {supervisorName}
            </h1>
            <p className="text-gray-500 font-medium text-[15px] md:text-base">
              Before you can accept student pitches, please complete your faculty profile.
            </p>
          </div>

          {/* Two-Column Layout for Desktop */}
          <div className="flex flex-col lg:flex-row gap-12 w-full mb-10">
            
            {/* LEFT COLUMN: Logistics & Bio */}
            <div className="flex-1 flex flex-col gap-5">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2">Logistics & Bio</h3>
              
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600">2nd Year Capacity</label>
                  <input 
                    type="number" min="0" name="year2Capacity"
                    value={formData.year2Capacity} onChange={handleInputChange}
                    className="border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-600">4th Year Capacity</label>
                  <input 
                    type="number" min="0" name="year4Capacity"
                    value={formData.year4Capacity} onChange={handleInputChange}
                    className="border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-600">Office Location</label>
                <input 
                  type="text" name="officeLocation" placeholder="e.g. Block B, Room 402"
                  value={formData.officeLocation} onChange={handleInputChange}
                  className="border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-600">Office Hours</label>
                <input 
                  type="text" name="officeHours" placeholder="e.g. Tuesdays 2PM - 4PM"
                  value={formData.officeHours} onChange={handleInputChange}
                  className="border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-600">Professional Bio</label>
                <textarea 
                  name="bio" rows="4" placeholder="Briefly describe your academic background and research focus..."
                  value={formData.bio} onChange={handleInputChange}
                  className="border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-600 font-medium resize-none"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Research Interests */}
            <div className="flex-1 flex flex-col gap-5">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2">Research Areas</h3>
              <p className="text-sm text-gray-500 font-medium mb-2">Select the topics you are willing to supervise.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {TECH_AREAS.map((area) => {
                  const isSelected = selectedInterests.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleInterest(area)}
                      className={`px-2 py-3 rounded-xl font-bold text-[12px] transition-all duration-200 
                        ${isSelected 
                          ? 'text-white shadow-inner scale-95' 
                          : 'text-white bg-gray-400 hover:bg-gray-500 shadow-md hover:-translate-y-0.5' 
                        }
                      `}
                      style={isSelected ? { backgroundColor: BRAND } : {}}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center w-full mt-auto">
            <button
              onClick={handleConfirm}
              disabled={selectedInterests.length === 0 || isSubmitting}
              className="w-full md:w-2/3 py-4 rounded-xl text-white font-bold text-lg transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND }}
            >
              {isSubmitting ? "Saving Profile..." : "Complete Setup & Enter Dashboard"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupervisorInterestsSetup;