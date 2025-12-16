import React from "react";
import SearchBox from "@Components/Competency/SearchBox";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  query?: string;
}

/**
 * SearchHeader Component
 *
 * Enhanced search section with title, description, search box, and tips
 */
const SearchHeader: React.FC<SearchHeaderProps> = ({ searchTerm, onSearchTermChange, onSearch, placeholder, query }) => {
  return (
    <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
      <div className="text-center mb-4 sm:mb-6 px-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2 py-5 tracking-tight">ค้นหาข้อมูลสมรรถนะ</h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">ค้นหาข้อมูลสมรรถนะจากฐานข้อมูล SFIA และ TPQI พร้อมรายละเอียดที่ครบถ้วน</p>
      </div>

      {/* Search Box with enhanced styling */}
      <div className="relative px-4 sm:px-0">
        <SearchBox searchTerm={searchTerm} onSearchTermChange={onSearchTermChange} onSearch={onSearch} placeholder={placeholder} variant="default" className="mb-8" />

        {/* Search tips */}
        {!query && (
          <div className="mt-3 sm:mt-4 text-center">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500"></div>
            <p className="mt-2 text-xs text-gray-400">เคล็ดลับ: ใช้คำหลักภาษาอังกฤษเพื่อผลลัพธ์ที่ดีที่สุด เช่น "software", "data", "management"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
