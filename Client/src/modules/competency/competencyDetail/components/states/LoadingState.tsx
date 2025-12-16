import React from "react";
import { motion } from "framer-motion";

const LoadingState: React.FC<{ source?: string; id?: string }> = ({
  source,
  id,
}) => (
  <motion.div
    key="loading"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center justify-center min-h-96"
  >
    <div className="inline-flex flex-col items-center space-y-4 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-teal-400 rounded-full animate-spin animation-delay-75"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          กำลังโหลดข้อมูล
        </h3>
        <p className="text-gray-600">
          กำลังดึงข้อมูลรายละเอียด {source?.toUpperCase()} competency...
        </p>
        {id && (
          <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span>รหัส: {id}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default LoadingState;
