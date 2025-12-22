import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/home" className="flex items-center space-x-1">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">ompetency</span>
      </Link>
    </div>
  );
};

export default Logo;
