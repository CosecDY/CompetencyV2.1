import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const NoDataState: React.FC<{ source?: string; id?: string; onGoBack: () => void }> = ({ source, id, onGoBack }) => (
  <div className="text-center py-1">
    <FaExclamationTriangle className="text-gray-400 text-6xl mx-auto mb-6" />
    <h1 className="text-2xl font-bold text-gray-800 mb-4">No Data Found</h1>
    <p className="text-gray-600 mb-6">
      We couldn't find any information for {source?.toUpperCase()} competency: {id}
    </p>
    <button
      onClick={onGoBack}
      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-colors"
    >
      Go Back
    </button>
  </div>
);

export default NoDataState;
