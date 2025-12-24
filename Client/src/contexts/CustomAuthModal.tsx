import React, { ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const CustomAuthModal: React.FC<CustomModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="theme-competency fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
      {/* Backdrop: เบลอพื้นหลังเล็กน้อย ให้ Modal เด่นขึ้น */}
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[4px] transition-all duration-300" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Accent Bar: แถบสีด้านบนสุด */}
        <div className="h-1.5 w-full bg-[#0d9488]" />

        {/* Close Button: มุมขวาบน */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
          <X size={20} />
        </button>

        <div className="p-8 pt-10 text-center">
          {/* Featured Icon: วงกลมตรงกลาง */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ccfbf1] mb-6">
            <AlertCircle className="h-8 w-8 text-[#0f766e]" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title || "แจ้งเตือนระบบ"}</h3>

          {/* Content */}
          <div className="text-slate-500 text-sm leading-relaxed mb-8">{children}</div>

          {/* Main Action Button */}
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center items-center px-4 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAuthModal;
