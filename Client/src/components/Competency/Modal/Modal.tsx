import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, className }) => {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Create portal root if it doesn't exist
  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const el = document.createElement("div");
      el.setAttribute("id", "modal-root");
      document.body.appendChild(el);
      return el;
    })();

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className={`relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 z-10 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition rounded"
          ></button>
        </div>

        {/* Body */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default Modal;
