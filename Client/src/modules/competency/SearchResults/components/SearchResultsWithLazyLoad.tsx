import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, ArrowUp, Search } from "lucide-react";
import { ResultsList } from "./ui";

interface ItemType {
  id: string;
  name: string;
  framework: string;
}

interface SearchResultsWithLazyLoadProps {
  items: ItemType[];
  onViewDetails: (id: string) => void;
  query: string;
  isSearching?: boolean;
  onSearch?: (debouncedQuery: string) => void; // Add callback for debounced search
  searchDelay?: number; // Configurable delay
}

// Custom hook for debounced search
const useDebounceSearch = (
  query: string,
  delay: number = 500,
  onSearch?: (debouncedQuery: string) => void
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Set typing state when query changes
    if (query !== debouncedQuery) {
      setIsTyping(true);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false);

      // Call the search callback with debounced query
      if (onSearch && query.length > 0) {
        onSearch(query);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay, onSearch, debouncedQuery]);

  return { debouncedQuery, isTyping };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0.95 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

// Custom hook for scroll functionality
const useScrollToTop = () => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return () => {
    if (shouldReduceMotion) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollStep = () => {
      if (window.pageYOffset > 0) {
        window.scrollTo(0, window.pageYOffset - window.pageYOffset * 0.1);
        requestAnimationFrame(scrollStep);
      }
    };
    requestAnimationFrame(scrollStep);
  };
};

// Typing indicator component
const TypingIndicator: React.FC<{
  query: string;
  shouldReduceMotion: boolean;
}> = ({ query, shouldReduceMotion }) => (
  <motion.div
    variants={shouldReduceMotion ? {} : containerVariants}
    initial={shouldReduceMotion ? false : "hidden"}
    animate={shouldReduceMotion ? false : "visible"}
    className="w-full"
  >
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3 text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-100">
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
        <span className="text-sm">Typing "{query}"...</span>
      </div>
    </div>
  </motion.div>
);

// Loading state component
const LoadingState: React.FC<{
  query: string;
  shouldReduceMotion: boolean;
}> = ({ query, shouldReduceMotion }) => (
  <motion.div
    variants={shouldReduceMotion ? {} : containerVariants}
    initial={shouldReduceMotion ? false : "hidden"}
    animate={shouldReduceMotion ? false : "visible"}
    className="w-full"
  >
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-200/50">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-medium">Searching for "{query}"...</span>
      </div>
    </div>
  </motion.div>
);

// Empty state component
const EmptyState: React.FC<{ query: string; shouldReduceMotion: boolean }> = ({
  query,
  shouldReduceMotion,
}) => (
  <motion.div
    variants={shouldReduceMotion ? {} : containerVariants}
    initial={shouldReduceMotion ? false : "hidden"}
    animate={shouldReduceMotion ? false : "visible"}
    className="w-full"
  >
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500 max-w-md">
            No competencies found for{" "}
            <span className="font-medium text-gray-700">"{query}"</span>. Try
            different keywords or check your spelling.
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Initial state component
const InitialState: React.FC<{ shouldReduceMotion: boolean }> = ({
  shouldReduceMotion,
}) => (
  <motion.div
    variants={shouldReduceMotion ? {} : containerVariants}
    initial={shouldReduceMotion ? false : "hidden"}
    animate={shouldReduceMotion ? false : "visible"}
    className="w-full"
  >
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Search className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search Competencies
          </h3>
          <p className="text-gray-500 max-w-md">
            Start typing to search for competencies across SFIA and TPQI
            frameworks.
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

// End of results component
const EndOfResults: React.FC<{
  shouldReduceMotion: boolean;
  onScrollToTop: () => void;
}> = ({ shouldReduceMotion, onScrollToTop }) => (
  <motion.div
    key="end-of-results"
    initial={shouldReduceMotion ? false : { opacity: 0.8 }}
    animate={shouldReduceMotion ? false : { opacity: 1 }}
    transition={
      shouldReduceMotion
        ? {}
        : {
            duration: 0.15,
            ease: "easeOut",
          }
    }
    className="flex flex-col items-center gap-3 p-6 text-center"
    style={{ willChange: "opacity" }}
  >
    <div className="p-2 bg-gray-50 rounded-full">
      <ArrowUp className="w-4 h-4 text-gray-400" />
    </div>
    <div>
      <p className="text-gray-600 text-sm mb-1">
        You've reached the end of the results
      </p>
      <button
        onClick={onScrollToTop}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-150 underline decoration-2 underline-offset-2 hover:no-underline"
      >
        Back to top
      </button>
    </div>
  </motion.div>
);

// Results stats component

const SearchResultsWithLazyLoad: React.FC<SearchResultsWithLazyLoadProps> = ({
  items,
  onViewDetails,
  query,
  isSearching = false,
  onSearch,
  searchDelay = 500, // Default 500ms delay
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [hasSearched, setHasSearched] = useState(false);
  const scrollToTop = useScrollToTop();

  // Use debounced search hook
  const { debouncedQuery, isTyping } = useDebounceSearch(
    query,
    searchDelay,
    onSearch
  );

  // Track when a search has been initiated
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  // For now, let's bypass lazy loading and show all items
  const displayedItems = items;
  const hasMore = false;
  const loadMoreItems = () => {};

  // Show typing indicator when user is typing (before debounce)
  if (isTyping && query.length > 0) {
    return (
      <TypingIndicator query={query} shouldReduceMotion={shouldReduceMotion} />
    );
  }

  // Show loading state when actually searching
  if (isSearching && debouncedQuery.length > 0) {
    return (
      <LoadingState
        query={debouncedQuery}
        shouldReduceMotion={shouldReduceMotion}
      />
    );
  }

  // Show empty state if search is complete and no results found
  const showEmptyState =
    hasSearched &&
    !isSearching &&
    items.length === 0 &&
    debouncedQuery.length > 0;
  if (showEmptyState) {
    return (
      <EmptyState
        query={debouncedQuery}
        shouldReduceMotion={shouldReduceMotion}
      />
    );
  }

  // Show initial state when no search has been performed
  if (!hasSearched && debouncedQuery.length === 0) {
    return <InitialState shouldReduceMotion={shouldReduceMotion} />;
  }

  // Show results when search is complete and has results
  return (
    <motion.div
      key={`search-results-${debouncedQuery}`}
      variants={shouldReduceMotion ? {} : containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? false : "visible"}
      className="w-full"
      style={{ willChange: "opacity, transform" }}
    >
      <div className="space-y-4">
        <ResultsList items={displayedItems} onViewDetails={onViewDetails} />

        {hasMore && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMoreItems}
              className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-all duration-150 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Load More Results
            </button>
          </div>
        )}

        {!hasMore && items.length > 12 && (
          <EndOfResults
            shouldReduceMotion={shouldReduceMotion}
            onScrollToTop={scrollToTop}
          />
        )}
      </div>
    </motion.div>
  );
};

export default SearchResultsWithLazyLoad;
