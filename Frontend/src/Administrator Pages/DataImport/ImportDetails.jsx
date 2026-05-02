import React from 'react';
import { FiArrowLeft, FiDatabase, FiAlertCircle } from 'react-icons/fi';

const BRAND = "#2b20d6";

export default function ImportDetails({ log, onBack }) {
  if (!log) return null;

  // Safely parse the error report if it comes in as a string
  let errorReport = log.error_report;
  if (typeof errorReport === 'string') {
    try { errorReport = JSON.parse(errorReport); } catch (e) { errorReport = []; }
  }

  return (
    <div className="w-full relative flex flex-col items-center">
      
      <button
        onClick={onBack}
        className="absolute top-0 left-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition-opacity"
        style={{ backgroundColor: BRAND }}
      >
        <FiArrowLeft size={18} strokeWidth={3} />
        Back
      </button>

      <h2 className="text-xl sm:text-2xl font-extrabold text-center mb-8 mt-12 sm:mt-0" style={{ color: BRAND }}>
        Import Details
      </h2>

      <div className="w-full max-w-4xl bg-white border rounded-2xl p-6 lg:p-8 flex flex-col shadow-sm" style={{ borderColor: BRAND }}>
        
        {/* Summary Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Filename</p>
            <p className="font-bold text-gray-900">{log.filename}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Upload Target</p>
            <p className="font-bold text-gray-900">{log.upload_type}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Records Added</p>
            <p className="font-extrabold text-2xl" style={{ color: BRAND }}>{log.records_added}</p>
          </div>
        </div>

        {/* Error Report Section */}
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FiAlertCircle className={log.status === 'Success' ? "text-green-500" : "text-red-500"} /> 
          Processing Log / Error Report
        </h3>
        
        <div className="w-full bg-gray-900 rounded-xl p-4 overflow-auto max-h-[300px]">
          {errorReport && Object.keys(errorReport).length > 0 ? (
            <pre className="text-xs font-mono text-green-400">
              {JSON.stringify(errorReport, null, 2)}
            </pre>
          ) : (
            <p className="text-sm font-mono text-gray-400">No errors reported. File processed entirely successfully.</p>
          )}
        </div>

      </div>
    </div>
  );
}