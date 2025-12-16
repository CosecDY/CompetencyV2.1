import React from "react";
import { motion } from "framer-motion";

interface SearchWelcomeStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

/**
 * SearchWelcomeState Component
 * 
 * Displays welcome state with search suggestions when no query is entered
 */
const SearchWelcomeState: React.FC<SearchWelcomeStateProps> = ({ onSuggestionClick }) => {
  const popularSuggestions = ["Software", "Security", "Project Management", "Programming"];

  return (
    <motion.div
      key="no-query"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-1"
    >
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">เริ่มต้นการค้นหา</h3>
          <p className="text-gray-600 mb-6">
            ป้อนคำหลักในช่องค้นหาด้านบนเพื่อเริ่มค้นหาข้อมูลสมรรถนะจากฐานข้อมูล SFIA และ TPQI
          </p>
          
          {/* Popular search suggestions */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">คำหลักยอดนิยม:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchWelcomeState;
