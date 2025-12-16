import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";

interface SearchEmptyStateProps {
  query: string;
  onNewSearch: () => void;
}

// Enhanced search suggestions based on query analysis
const generateSmartSuggestions = (query: string) => {
  const lowerQuery = query.toLowerCase();
  
  // Analyze query and provide contextual suggestions
  const suggestions = {
    alternative: [] as string[],
    broader: [] as string[],
    related: [] as string[]
  };

  // Common typos and alternatives
  if (lowerQuery.includes('software') || lowerQuery.includes('sofware')) {
    suggestions.alternative.push('Software Development', 'Software Engineering', 'Software Design');
  }
  if (lowerQuery.includes('security') || lowerQuery.includes('secuirty')) {
    suggestions.alternative.push('Information Security', 'Cyber Security', 'Data Protection');
  }
  if (lowerQuery.includes('project') || lowerQuery.includes('managment')) {
    suggestions.alternative.push('Project Management', 'Programme Management', 'Portfolio Management');
  }
  if (lowerQuery.includes('data') || lowerQuery.includes('database')) {
    suggestions.alternative.push('Data Analysis', 'Database Design', 'Data Science');
  }

  // Broader search terms
  if (lowerQuery.length > 15) {
    const words = lowerQuery.split(' ');
    suggestions.broader = words.slice(0, 2); // Use first 2 words for broader search
  }

  // Related terms based on common patterns
  if (lowerQuery.includes('web') || lowerQuery.includes('frontend')) {
    suggestions.related.push('User Experience', 'Interface Design', 'Web Development');
  }
  if (lowerQuery.includes('backend') || lowerQuery.includes('server')) {
    suggestions.related.push('Systems Administration', 'Database Management', 'API Development');
  }

  return suggestions;
};

// Search tips based on query characteristics
const getSearchTips = (query: string) => {
  const tips: string[] = [];
  
  if (query.length < 3) {
    tips.push('คำค้นหาสั้นเกินไป ลองใช้คำที่มีความหมายชัดเจนมากขึ้น');
  }
  if (query.length > 50) {
    tips.push('คำค้นหายาวเกินไป ลองใช้คำหลักที่สั้นและกระชับ');
  }
  if (!/[a-zA-Z]/.test(query)) {
    tips.push('ลองใช้คำภาษาอังกฤษ เนื่องจากข้อมูลส่วนใหญ่เป็นภาษาอังกฤษ');
  }
  if (/\d/.test(query) && !query.toLowerCase().includes('level')) {
    tips.push('หากต้องการค้นหาตามระดับ ลองใช้ "Level 1", "Level 2" เป็นต้น');
  }
  if (query.includes(' ') && query.split(' ').length > 3) {
    tips.push('ลองใช้คำหลักที่เฉพาะเจาะจงมากขึ้น');
  }

  // Default tips if no specific suggestions
  if (tips.length === 0) {
    tips.push(
      'ตรวจสอบการสะกดคำ',
      'ลองใช้คำภาษาอังกฤษ',
      'ใช้คำหลักที่กว้างขึ้น'
    );
  }

  return tips;
};

/**
 * Enhanced SearchEmptyState Component with Intelligent Suggestions
 * 
 * Features:
 * - Smart suggestion generation based on query analysis
 * - Contextual search tips
 * - Alternative search strategies
 * - Enhanced UX with better visual hierarchy
 */
const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ query, onNewSearch }) => {
  // Memoized smart suggestions for performance
  const smartSuggestions = useMemo(() => generateSmartSuggestions(query), [query]);
  const searchTips = useMemo(() => getSearchTips(query), [query]);

  // Enhanced suggestion click handler
  const handleSuggestionClick = useCallback((suggestion: string) => {
    // Trigger search with suggestion (would need to be passed from parent)
    console.log(`Suggestion clicked: ${suggestion}`);
    // For now, we'll just trigger a new search
    onNewSearch();
  }, [onNewSearch]);

  // Memoized animation variants
  const containerVariants = useMemo(() => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }), []);

  return (
    <motion.div
      key={`empty-${query}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex items-center justify-center py-8"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ไม่พบผลลัพธ์
            </h3>
            <p className="text-gray-600 mb-4">
              ไม่พบข้อมูลที่ตรงกับคำค้นหา{" "}
              <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded mx-1">
                "{query}"
              </span>{" "}
              ในฐานข้อมูล
            </p>
          </div>

          {/* Smart Suggestions */}
          {(smartSuggestions.alternative.length > 0 || smartSuggestions.related.length > 0) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                คำแนะนำที่เกี่ยวข้อง
              </h4>
              
              <div className="space-y-3">
                {smartSuggestions.alternative.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">คำที่คล้ายกัน:</p>
                    <div className="flex flex-wrap gap-2">
                      {smartSuggestions.alternative.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {smartSuggestions.related.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">หัวข้อที่เกี่ยวข้อง:</p>
                    <div className="flex flex-wrap gap-2">
                      {smartSuggestions.related.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 hover:border-green-300 transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              เคล็ดลับการค้นหา
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              {searchTips.map((tip) => (
                <li key={tip} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onNewSearch}
              className="inline-flex items-center justify-center px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ค้นหาใหม่
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </button>
          </div>

          {/* Query Analysis (for debugging/insights) */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">ข้อมูลการค้นหา</summary>
              <div className="mt-2 space-y-1">
                <p>ความยาวคำค้นหา: {query.length} ตัวอักษร</p>
                <p>จำนวนคำ: {query.split(' ').length} คำ</p>
                <p>มีตัวเลข: {/\d/.test(query) ? 'ใช่' : 'ไม่'}</p>
                <p>เป็นภาษาอังกฤษ: {/[a-zA-Z]/.test(query) ? 'ใช่' : 'ไม่'}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchEmptyState;
