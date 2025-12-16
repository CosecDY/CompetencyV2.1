import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), duration);
    const closeTimer = setTimeout(onClose, duration + 300);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="w-6 h-6 text-green-600" />,
    error: <FiXCircle className="w-6 h-6 text-red-600" />,
    info: <FiInfo className="w-6 h-6 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-300",
    error: "bg-red-50 border-red-300",
    info: "bg-blue-50 border-blue-300",
  };

  const toastElement = (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-5 right-5 max-w-sm w-full
        flex items-center space-x-3
        border rounded-lg p-4 shadow-md
        ${bgColors[type]}
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        z-[9999]
      `}
    >
      {icons[type]}
      <div className="flex-1 text-gray-800 font-medium text-sm">{message}</div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Close notification"
        className="text-gray-400 hover:text-gray-700 transition"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
  return createPortal(toastElement, document.body);
}
