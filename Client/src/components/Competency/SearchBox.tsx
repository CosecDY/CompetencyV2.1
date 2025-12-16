import React, { useCallback } from "react";

interface SearchBoxProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: (term: string) => void;
  placeholder?: string;
  variant?: "default" | "hero";
  className?: string;
}

/**
 * Common SearchBox Component
 * 
 * A reusable search box component with two variants:
 * - default: Simple styling for general use
 * - hero: Enhanced styling with gradient and backdrop blur for hero sections
 */
const SearchBox: React.FC<SearchBoxProps> = React.memo(
  ({
    searchTerm,
    onSearchTermChange,
    onSearch,
    placeholder = "ค้นหาสมรรถนะ...",
    variant = "default",
    className = "",
  }) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchTerm.trim() !== "") {
          onSearch(searchTerm.trim());
        }
      },
      [onSearch, searchTerm]
    );

    const handleSearchClick = useCallback(() => {
      if (searchTerm.trim() !== "") {
        onSearch(searchTerm.trim());
      }
    }, [onSearch, searchTerm]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchTermChange(e.target.value);
      },
      [onSearchTermChange]
    );

    const isHeroVariant = variant === "hero";

    const containerClasses = isHeroVariant
      ? "relative w-full max-w-2xl"
      : "relative w-full max-w-xl";

    const inputClasses = isHeroVariant
      ? "w-full pl-12 pr-28 py-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-2xl border-2 border-teal-200 shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 hover:border-teal-300"
      : "w-full pl-12 pr-28 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition placeholder:text-gray-400";

    const buttonClasses = isHeroVariant
      ? "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-5 py-2 rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 hover:scale-105 active:scale-95"
      : "absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2";

    return (
      <div className={`relative flex justify-center ${className}`}>
        <div className={containerClasses}>
          <svg
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600 z-10 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>

          <input
            type="text"
            placeholder={placeholder}
            className={inputClasses}
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSearchClick}
            aria-label="Search"
            className={buttonClasses}
          >
            ค้นหา
          </button>
        </div>
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";

export default SearchBox;
