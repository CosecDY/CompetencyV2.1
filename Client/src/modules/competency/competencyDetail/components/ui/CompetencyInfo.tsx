import React from "react";
import { FaInfoCircle, FaClock } from "react-icons/fa";

interface CompetencyInfoProps {
  id: string;
  lastFetched?: Date;
}

const CompetencyInfo: React.FC<CompetencyInfoProps> = ({ id, lastFetched }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
        <FaInfoCircle className="w-4 h-4 mr-2 text-blue-600" />
        <span className="font-medium text-gray-700">Code:</span>
        <span className="ml-1 font-mono text-blue-600">{id}</span>
      </div>

      {lastFetched && (
        <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
          <FaClock className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-sm text-gray-600">
            Updated: {lastFetched.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompetencyInfo;
