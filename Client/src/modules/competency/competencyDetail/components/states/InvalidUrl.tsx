import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const InvalidUrl: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-25 pt-20 flex items-center justify-center">
    <div className="text-center p-8">
      <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid URL</h1>
      <p className="text-gray-600 mb-6">Please check the competency source and ID.</p>
      <button
        onClick={onGoHome}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors"
      >
        Go to Home
      </button>
    </div>
  </div>
);

export default InvalidUrl;
