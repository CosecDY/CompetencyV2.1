import React, { FC, ReactNode, MouseEvent, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX } from "react-icons/fi";

export interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, actions, className = "" }) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => onClose();
  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${className}`} onClick={handleOverlayClick}>
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50 z-[51]" />
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-lg max-w-lg w-full mx-4 p-6 z-[52]" onClick={stopPropagation}>
        {title && (
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
              <FiX size={24} />
            </button>
          </div>
        )}
        <div className="mb-6 text-gray-700">{children}</div>
        <div className="flex justify-end space-x-2">
          {actions ? (
            actions
          ) : (
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
