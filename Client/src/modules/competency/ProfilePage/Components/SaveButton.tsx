import React from "react";

interface SaveButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = ""
}) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          group relative inline-flex items-center justify-center 
          px-12 py-4 bg-gradient-to-r from-teal-600 to-blue-600 
          hover:from-teal-700 hover:to-blue-700 
          disabled:from-gray-400 disabled:to-gray-500
          text-white font-semibold rounded-2xl 
          shadow-xl hover:shadow-2xl 
          transform hover:-translate-y-1 
          transition-all duration-300 text-lg
          focus:ring-4 focus:ring-teal-200 focus:outline-none
          disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Content */}
        <div className="relative flex items-center space-x-3">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <i className="fas fa-save group-hover:scale-110 transition-transform duration-200"></i>
              <span>บันทึกการเปลี่ยนแปลง</span>
            </>
          )}
        </div>
        
        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
        </div>
      </button>
    </div>
  );
};
