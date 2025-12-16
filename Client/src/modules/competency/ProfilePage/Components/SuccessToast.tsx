import React from "react";

interface SuccessToastProps {
  isVisible: boolean;
  message: string;
  onClose?: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  isVisible,
  message,
  onClose
}) => {
  return (
    <div
      className={`
        fixed top-6 right-6 
        bg-gradient-to-r from-emerald-500 to-teal-500 
        text-white px-8 py-4 rounded-2xl 
        shadow-2xl border border-emerald-400
        transform transition-all duration-500 z-50
        ${isVisible ? "translate-x-0 scale-100 opacity-100" : "translate-x-full scale-95 opacity-0"}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <i className="fas fa-check-circle text-xl"></i>
        </div>
        <span className="font-semibold text-lg">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
        <div className="h-full bg-white animate-progress"></div>
      </div>
    </div>
  );
};
