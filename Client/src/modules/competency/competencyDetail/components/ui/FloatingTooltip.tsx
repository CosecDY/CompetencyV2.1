import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingTooltipProps {
  showTooltip: string | null;
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({ showTooltip }) => {
  const getTooltipText = (key: string) => {
    const tooltips: Record<string, string> = {
      bookmark: "Bookmark this competency",
      favorite: "Add to favorites",
      share: "Share this competency",
      print: "Print this page",
      download: "Download as PDF",
    };
    return tooltips[key] || key;
  };

  return (
    <AnimatePresence>
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none"
        >
          {getTooltipText(showTooltip)}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingTooltip;
