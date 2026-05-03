import { useState } from "react";
import { FiUser, FiPhone, FiMail, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";

const BRAND = "#2b20d6";

const EditAccountDetailsForm = ({ studentData, setStudentData, fullName }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleUpdatePhone = async () => {
    const phone = studentData.phoneNumber?.trim();

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/students/me/phone", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Phone number updated successfully!");
      } else {
        toast.error(data.message || "Failed to update phone number.");
      }
    } catch {
      toast.error("Network error. Could not save phone number.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-6">
      <h3 className="text-xl font-bold" style={{ color: BRAND }}>Edit Account Details</h3>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Full Name — read-only */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-500 font-medium">Full Name</label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              value={fullName}
              disabled
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Phone Number — editable */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold" style={{ color: BRAND }}>Phone Number</label>
          <div className="relative flex items-center">
            <FiPhone className="absolute left-3" style={{ color: BRAND }} size={18} />
            <input
              type="text"
              name="phoneNumber"
              value={studentData.phoneNumber}
              onChange={handleGenericChange}
              className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border-2 text-sm font-semibold focus:outline-none"
              style={{ borderColor: BRAND, color: BRAND }}
            />
          </div>
        </div>

        {/* Email — read-only */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-500 font-medium">Email Address</label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-3 text-gray-400" size={18} />
            <input
              type="email"
              value={studentData.email}
              disabled
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Reg Number + Year — both read-only */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-500 font-medium">Reg Number</label>
            <div className="relative flex items-center">
              <FiHash className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                value={studentData.registrationNumber}
                disabled
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-500 font-medium">Year</label>
            <div className="relative flex items-center">
              <FiHash className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                value={studentData.year}
                disabled
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="md:col-span-2 flex justify-end mt-2">
          <button
            type="button"
            onClick={handleUpdatePhone}
            disabled={isSaving}
            className="px-6 py-2.5 text-white rounded-lg font-medium text-sm transition hover:opacity-90 shadow-sm disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {isSaving ? "Saving..." : "Update Phone Number"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditAccountDetailsForm;