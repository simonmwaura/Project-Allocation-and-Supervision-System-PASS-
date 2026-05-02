import React, { useState, useMemo } from "react";
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserMinus, 
  FiUserX, 
  FiSearch, 
  FiChevronDown
} from "react-icons/fi";
// IMPORT THE NEW COMPONENT
import StudentAccountDetails from "./StudentAccountDetails"; 

const BRAND = "#2b20d6";

// --- Metric Card ---
const MetricCard = ({ icon: Icon, title, value, color, bgClass, textColor }) => {
  return (
    <div className={`border-[1.5px] rounded-2xl p-5 lg:p-6 flex items-center justify-between shadow-sm ${bgClass}`} style={{ borderColor: color }}>
      <div className="flex-shrink-0">
        <Icon size={40} strokeWidth={1.5} style={{ color: color }} />
      </div>
      <div className="flex flex-col items-center flex-1 ml-4 md:ml-6">
        <span className="font-bold text-[13px] lg:text-[14px] mb-2 whitespace-nowrap" style={{ color: textColor || color }}>
          {title}
        </span>
        <div className="w-full border-b-[1.5px]" style={{ borderColor: color }}></div>
        <span className="text-2xl lg:text-3xl font-extrabold mt-2" style={{ color: color }}>
          {value}
        </span>
      </div>
    </div>
  );
};

// --- Status Badge ---
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

// --- MAIN DASHBOARD COMPONENT ---
const StudentDashboardView = ({ students }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "Active").length;
  const pendingStudents = students.filter(s => s.status === "Pending").length;
  const suspendedStudents = students.filter(s => s.status === "Suspended").length;
  
  // This state tells React whether to show the Dashboard OR the Details view
  const [selectedStudent, setSelectedStudent] = useState(null); 

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.reg.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === "ALL" || student.year.toString() === yearFilter.replace(/\D/g, ''); 
      const matchesStatus = statusFilter === "ALL" || student.status === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [students, searchQuery, yearFilter, statusFilter]);

  // IF A STUDENT IS SELECTED, LOAD THE NEW COMPONENT
  if (selectedStudent) {
      return (
          <div className="w-full max-w-6xl bg-white border-[1.5px] rounded-[1.5rem] p-4 sm:p-6 lg:p-10 flex flex-col shadow-sm" style={{ borderColor: BRAND }}>
              <StudentAccountDetails student={selectedStudent} onBack={() => setSelectedStudent(null)} />
          </div>
      );
  }

  // OTHERWISE SHOW THE DASHBOARD
  return (
    <div className="w-full max-w-6xl bg-white border-[1.5px] rounded-[1.5rem] p-4 sm:p-6 lg:p-10 flex flex-col items-center shadow-sm" style={{ borderColor: BRAND }}>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8 sm:mb-10" style={{ color: BRAND }}>
        Student Account Management
      </h2>

      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl mb-10">
        <MetricCard icon={FiUsers} title="Total Students" value={totalStudents} color={BRAND} bgClass="bg-blue-50/30" />
        <MetricCard icon={FiUserCheck} title="Active Accounts" value={activeStudents} color="#16a34a" bgClass="bg-green-50/50" />
        <MetricCard icon={FiUserMinus} title="Pending Activation" value={pendingStudents} color="#eab308" textColor="#334155" bgClass="bg-yellow-50/50" />
        <MetricCard icon={FiUserX} title="Suspended" value={suspendedStudents} color="#ef4444" bgClass="bg-red-50/50" />
      </div>
      
      {/* 2. Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mb-8">
        <div className="flex-1 flex items-center gap-3 px-5 py-3 border-[1.5px] border-gray-300 rounded-full shadow-sm bg-white focus-within:border-[#2b20d6] transition-colors">
          <input
            type="text"
            placeholder="Search by Name or Reg Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[14px] sm:text-[15px] text-gray-700 outline-none placeholder-gray-400 font-medium min-w-0"
          />
          <FiSearch size={20} style={{ color: BRAND }} className="flex-shrink-0" />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => { setIsYearOpen(!isYearOpen); setIsStatusOpen(false); }}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border-[1.5px] rounded-full shadow-sm bg-white font-bold text-[13px] sm:text-[14px] whitespace-nowrap" 
              style={{ borderColor: BRAND, color: BRAND }}
            >
              Year: {yearFilter} <FiChevronDown size={18} />
            </button>
            {isYearOpen && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border-[1.5px] rounded-xl shadow-lg z-20 flex flex-col overflow-hidden" style={{ borderColor: BRAND }}>
                {["ALL", "2nd", "4th"].map((yearOption) => (
                  <button 
                    key={yearOption}
                    onClick={() => { setYearFilter(yearOption); setIsYearOpen(false); }}
                    className="px-4 py-3 text-left font-bold text-[13px] hover:bg-blue-50 transition-colors border-b last:border-0"
                    style={{ color: BRAND, borderColor: `${BRAND}30` }}
                  >
                    {yearOption}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsYearOpen(false); }}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border-[1.5px] rounded-full shadow-sm bg-white font-bold text-[13px] sm:text-[14px] whitespace-nowrap" 
              style={{ borderColor: BRAND, color: BRAND }}
            >
              Status: {statusFilter} <FiChevronDown size={18} />
            </button>
            {isStatusOpen && (
              <div className="absolute top-full mt-2 left-0 w-full min-w-[120px] bg-white border-[1.5px] rounded-xl shadow-lg z-20 flex flex-col overflow-hidden" style={{ borderColor: BRAND }}>
                {["ALL", "Active", "Pending", "Suspended"].map((statusOption) => (
                  <button 
                    key={statusOption}
                    onClick={() => { setStatusFilter(statusOption); setIsStatusOpen(false); }}
                    className="px-4 py-3 text-left font-bold text-[13px] hover:bg-blue-50 transition-colors border-b last:border-0"
                    style={{ color: BRAND, borderColor: `${BRAND}30` }}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="w-full max-w-5xl overflow-x-auto mt-2 pb-4">
        <table className="w-full border-collapse border-[1.5px] min-w-[800px]" style={{ borderColor: BRAND }}>
          <thead>
            <tr>
              {["#", "Student Name", "Registration Number", "Year", "Status", "Actions"].map((header) => (
                <th key={header} className="border-[1.5px] p-3.5 text-[14px] sm:text-[15px] font-extrabold text-center bg-white whitespace-nowrap" style={{ borderColor: BRAND, color: BRAND }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
                filteredStudents.map((row, index) => (
                  <tr key={row.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="border-[1.5px] p-3 text-center font-bold text-gray-800 text-[14px] sm:text-[15px]" style={{ borderColor: BRAND }}>{index + 1}</td>
                    <td className="border-[1.5px] p-3 text-center font-bold text-gray-900 text-[14px] sm:text-[15px] whitespace-nowrap" style={{ borderColor: BRAND }}>{row.name}</td>
                    <td className="border-[1.5px] p-3 text-center font-bold text-gray-800 text-[14px] sm:text-[15px] whitespace-nowrap" style={{ borderColor: BRAND }}>{row.reg}</td>
                    <td className="border-[1.5px] p-3 text-center font-bold text-gray-800 text-[14px] sm:text-[15px]" style={{ borderColor: BRAND }}>{row.year}</td>
                    <td className="border-[1.5px] p-3 text-center" style={{ borderColor: BRAND }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="border-[1.5px] p-3 text-center" style={{ borderColor: BRAND }}>
                      
                      {/* --- FIX: Updated Button Logic & Styling --- */}
                      <button 
                        onClick={() => setSelectedStudent(row)}
                        className="px-4 py-2 rounded-lg border-2 border-[#2b20d6] text-[#2b20d6] font-bold text-sm hover:bg-[#2b20d6] hover:text-white transition-all"
                      >
                        View Details
                      </button>

                    </td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="6" className="p-8 text-center font-bold text-gray-500">
                        No students match your filter criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboardView;