import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean; // ควบคุมการเปิดปิดผ่าน Prop
  title?: string;
  children: ReactNode;
  footer?: ReactNode; // เพิ่มส่วนท้าย (ปุ่ม Action)
  onClose: () => void;
  className?: string;
  size?: ModalSize; // ปรับขนาดได้
  disableClickOutside?: boolean; // ป้องกันการกดข้างนอกเพื่อปิด
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, footer, onClose, className = "", size = "md", disableClickOutside = false }) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Handle Mounting & Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // รอเล็กน้อยเพื่อให้ Animation ทำงาน
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      // รอ Animation จบก่อนค่อย Unmount
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
      }, 300); // ต้องตรงกับ duration-300 ใน CSS
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 2. Handle ESC Key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 3. Setup Portal Root
  if (!mounted && !isOpen) return null;

  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const el = document.createElement("div");
      el.setAttribute("id", "modal-root");
      document.body.appendChild(el);
      return el;
    })();

  // 4. Size Classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-4",
  };

  const modalContent = (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isVisible ? "visible opacity-100" : "invisible opacity-0"}`}>
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => !disableClickOutside && onClose()} aria-hidden="true" />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
          flex flex-col max-h-[90vh]
          transform transition-all duration-300 ease-out
          ${sizeClasses[size]}
          ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          {title ? <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3> : <div /> /* Spacer if no title */}

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close"
          >
            {/* X Icon SVG */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body (Scrollable if content is long) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>

        {/* Footer (Optional) */}
        {footer && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default Modal;
