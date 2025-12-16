import React from "react";

interface LastUpdatedFooterProps {
  lastFetched: Date | null;
}

const LastUpdatedFooter: React.FC<LastUpdatedFooterProps> = ({ lastFetched }) => {
  if (!lastFetched) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 text-center border border-gray-100 min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
          <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            Last updated: {lastFetched.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LastUpdatedFooter;
