import { CheckCircle, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

export interface ModalConfig {
  isOpen: boolean;
  type: "success" | "error" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function CustomModal({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  if (!config.isOpen) return null;

  const isConfirm = config.type === "confirm";
  const isError = config.type === "error";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 relative z-[10000]">
        <div className="flex flex-col items-center text-center">
          {/* ICON */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isError ? "bg-red-100 text-red-500" : isConfirm ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-500"
            }`}
          >
            {isError ? <AlertCircle size={28} /> : isConfirm ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">{config.title}</h3>
          <p className="text-slate-600 text-sm mb-6">{config.message}</p>

          <div className="flex gap-3 w-full">
            {isConfirm && (
              <button
                onClick={() => {
                  if (config.onCancel) config.onCancel();
                  else onClose();
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                ยกเลิก
              </button>
            )}

            <button
              onClick={() => {
                if (config.onConfirm) config.onConfirm();
                else onClose();
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors focus:outline-none focus:ring-4 ${
                isError ? "bg-red-500 hover:bg-red-600 focus:ring-red-300" : isConfirm ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300" : "bg-green-500 hover:bg-green-600 focus:ring-green-300"
              }`}
            >
              {isConfirm ? "ตกลง" : "รับทราบ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
