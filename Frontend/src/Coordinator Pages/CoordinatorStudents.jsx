import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiUsers, FiSearch, FiCheckCircle, FiAlertCircle, FiClock, FiUser } from "react-icons/fi";

const BRAND = "#2b20d6";

const CoordinatorStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // System overview stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    assigned: 0,
    unassigned: 0,
    pitching: 0,
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        // Replace with your actual endpoint once ready
        const res = await fetch("http://127.0.0.1:5000/api/coordinators/students-overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStudents(data.data);
          calculateStats(data.data);
        } else {
          // FALLBACK MOCK DATA
          const mockData = [
            { id: 1, firstName: "Alice", lastName: "Wanjiku", regNumber: "SCS3/148050/2024", email: "alice@students.uonbi.ac.ke", status: "Assigned", supervisor: "Dr. Elisha Opiyo" },
            { id: 2, firstName: "Brian", lastName: "Kipkorir", regNumber: "SCS3/148061/2024", email: "brian@students.uonbi.ac.ke", status: "Pitching", supervisor: null },
            { id: 3, firstName: "Ian", lastName: "Mutua", regNumber: "SCS3/148012/2024", email: "ian@students.uonbi.ac.ke", status: "Unassigned", supervisor: null },
            { id: 4, firstName: "Joy", lastName: "Achieng", regNumber: "SCS3/148099/2024", email: "joy@students.uonbi.ac.ke", status: "Assigned", supervisor: "Dr. Peter Wagacha" },
            { id: 5, firstName: "David", lastName: "Njoroge", regNumber: "SCS3/148033/2024", email: "david@students.uonbi.ac.ke", status: "Pitching", supervisor: null },
          ];
          setStudents(mockData);
          calculateStats(mockData);
        }
      } catch (error) {
        toast.error("Failed to fetch student data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const calculateStats = (data) => {
    const total = data.length;
    const assigned = data.filter(s => s.status === "Assigned").length;
    const unassigned = data.filter(s => s.status === "Unassigned").length;
    const pitching = data.filter(s => s.status === "Pitching").length;
    setStats({ totalStudents: total, assigned, unassigned, pitching });
  };

  const filteredStudents = students.filter(student => 
    `${student.firstName} ${student.lastName} ${student.regNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for status colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "Assigned":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1"><FiCheckCircle /> Assigned</span>;
      case "Pitching":
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg flex items-center gap-1"><FiClock /> Pitching</span>;
      case "Unassigned":
      default:
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1"><FiAlertCircle /> Unassigned</span>;
    }
  };

  if (isLoading) return <div className="p-10 font-bold text-center" style={{ color: BRAND }}>Loading Student Data...</div>;

  return (
    <div className="w-full h-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: BRAND }}>Student Projects</h1>
        <p className="text-gray-500 font-medium">Track student allocation status and identify those falling behind schedule.</p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><FiUsers size={20} style={{ color: BRAND }} /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Students</p>
            <p className="text-xl font-extrabold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><FiCheckCircle size={20} className="text-green-600" /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Allocated</p>
            <p className="text-xl font-extrabold text-gray-800">{stats.assigned}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl"><FiClock size={20} className="text-orange-500" /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Pitching</p>
            <p className="text-xl font-extrabold text-gray-800">{stats.pitching}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl"><FiAlertCircle size={20} className="text-red-500" /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Unassigned</p>
            <p className="text-xl font-extrabold text-gray-800">{stats.unassigned}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center gap-3">
        <FiSearch size={20} className="text-gray-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search by student name or registration number..." 
          className="w-full outline-none font-medium text-gray-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col relative">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-lg font-bold border border-blue-100" style={{ color: BRAND }}>
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 truncate">{student.firstName} {student.lastName}</h3>
                  <p className="text-xs font-bold text-gray-400">{student.regNumber}</p>
                </div>
              </div>
              {getStatusBadge(student.status)}
            </div>

            <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <FiUser className="text-gray-400" />
                <span className="font-bold text-gray-500">Supervisor:</span>
                <span className="font-bold text-gray-800 truncate">
                  {student.supervisor ? student.supervisor : "None"}
                </span>
              </div>
            </div>

          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">
            No students found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorStudents;