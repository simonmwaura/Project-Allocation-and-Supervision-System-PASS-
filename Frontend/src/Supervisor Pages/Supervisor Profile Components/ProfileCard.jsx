import { FiUser } from "react-icons/fi";
const BRAND = "#302AE2";

const ProfileCard = ({ profileData }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center text-center h-full">
      <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border-2 border-blue-100">
        <FiUser size={40} />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{profileData.fullName}</h3>
      
      <hr className="w-full border-t border-dashed border-gray-200 mb-6" />
      
      <div className="w-full flex flex-col space-y-4 text-sm text-left">
        <p className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="font-bold text-gray-700">Phone:</span> 
          <span className="text-gray-500 font-medium">{profileData.phoneNumber || "Not set"}</span>
        </p>
        <p className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="font-bold text-gray-700 mb-1">Email:</span> 
          <span className="font-medium truncate" style={{ color: BRAND }}>{profileData.email}</span>
        </p>
      </div>
    </div>
  );
};
export default ProfileCard;