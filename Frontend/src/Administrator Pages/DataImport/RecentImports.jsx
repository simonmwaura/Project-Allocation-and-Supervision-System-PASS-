import React from 'react';

const BRAND = "#2b20d6";

const StatusPill = ({ status }) => {
  switch (status) {
    case 'Success':
      return <span className="px-4 py-1 rounded-full border border-green-500 text-green-600 bg-green-50 text-xs font-bold">Success</span>;
    case 'Partial':
      return <span className="px-4 py-1 rounded-full border border-yellow-400 text-yellow-600 bg-yellow-50 text-xs font-bold">Partial</span>;
    case 'Fail':
      return <span className="px-4 py-1 rounded-full border border-red-500 text-red-600 bg-red-50 text-xs font-bold">Failed</span>;
    default:
      return null;
  }
};

export default function RecentImports({ logs, isLoading, onViewDetails }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: BRAND }}>
      <h3 className="text-lg font-extrabold text-center mb-6" style={{ color: BRAND }}>
        Recent Imports
      </h3>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border-[1.5px] min-w-[600px]" style={{ borderColor: BRAND }}>
          <thead>
            <tr>
              {["#", "Date", "Data Target", "Status", "Actions"].map((header) => (
                <th key={header} className="border-[1.5px] p-3 text-[14px] font-extrabold text-center bg-[#fbfbfd]" style={{ borderColor: BRAND, color: BRAND }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center font-bold text-gray-400 animate-pulse">Loading history...</td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={log.log_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="border-[1.5px] p-3 text-center font-bold text-gray-800 text-[14px]" style={{ borderColor: BRAND }}>{index + 1}</td>
                  <td className="border-[1.5px] p-3 text-center font-bold text-gray-900 text-[14px]" style={{ borderColor: BRAND }}>
                    {new Date(log.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="border-[1.5px] p-3 text-center font-bold text-gray-900 text-[14px]" style={{ borderColor: BRAND }}>{log.upload_type}</td>
                  <td className="border-[1.5px] p-3 text-center" style={{ borderColor: BRAND }}>
                    <StatusPill status={log.status} />
                  </td>
                  <td className="border-[1.5px] p-3 text-center" style={{ borderColor: BRAND }}>
                    <button 
                      onClick={() => onViewDetails(log)}
                      className="px-4 py-1.5 rounded border font-bold text-xs hover:bg-blue-50 transition-colors"
                      style={{ borderColor: BRAND, color: BRAND }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center font-bold text-gray-400">No import records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}