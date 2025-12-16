import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// State Components
import {
  SearchLoadingState,
  SearchErrorState,
  SearchWelcomeState,
  SearchEmptyState,
  SearchSuccessState,
} from "./states";

// Simple typing indicator component
const SearchTypingState: React.FC<{ query: string }> = ({ query }) => (
  <motion.div
    className="flex items-center justify-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center gap-3 text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-100">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span className="text-sm font-medium">กำลังพิมพ์ "{query}"...</span>
    </div>
  </motion.div>
);

interface CompetencyItem {
  id: string;
  name: string; // Add the missing 'name' property
  framework: string;
  [key: string]: unknown;
}

interface SearchContentProps {
  loading: boolean;
  isTyping?: boolean; // Add typing state prop
  error: string | null;
  query: string;
  pageItems: CompetencyItem[];
  onViewDetails: (itemId: string) => void;
  onRetry: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onNewSearch: () => void;
}
const createAnimationVariants = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) return undefined;

  return {
    initial: { opacity: 0.95 }, // Start with high opacity to prevent harsh transitions
    animate: {
      opacity: 1,
      transition: {
        duration: 0.15, // Very fast transition
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0.95, // Exit to high opacity instead of 0
      transition: {
        duration: 0.1,
        ease: "easeIn",
      },
    },
  };
};

// Wrapper component for animated states
const AnimatedStateWrapper: React.FC<{
  children: React.ReactNode;
  stateKey: string;
  prefersReducedMotion: boolean;
}> = ({ children, stateKey, prefersReducedMotion }) => {
  const variants = createAnimationVariants(prefersReducedMotion);

  return (
    <motion.div
      key={stateKey}
      variants={variants}
      initial={prefersReducedMotion ? false : "initial"}
      animate={prefersReducedMotion ? false : "animate"}
      exit={prefersReducedMotion ? undefined : "exit"}
      style={{ willChange: "opacity" }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
};

/**
 * Enhanced SearchContent Component
 *
 * Manages the display of different search states using AnimatePresence
 * for smooth transitions between loading, error, empty, and success states
 * with anti-blink optimizations
 */
const SearchContent: React.FC<SearchContentProps> = ({
  loading,
  isTyping = false,
  error,
  query,
  pageItems,
  onViewDetails,
  onRetry,
  onSuggestionClick,
  onNewSearch,
}) => {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Render conditions to determine which component state to show
  const renderConditions = {
    isTyping: isTyping && !loading && !error && query.length > 0,
    isLoading: loading && !isTyping,
    hasError: error && !loading && !isTyping,
    hasNoQuery: !loading && !error && !query && !isTyping,
    isEmpty: !loading && !error && query && pageItems.length === 0 && !isTyping,
    hasResults:
      !loading && !error && query && pageItems.length > 0 && !isTyping,
  };

  return (
    <motion.div
      className="flex-1 flex flex-col"
      style={{ willChange: "opacity" }} // Optimize for GPU acceleration
      initial={prefersReducedMotion ? false : { opacity: 0.98 }}
      animate={prefersReducedMotion ? false : { opacity: 1 }}
      transition={prefersReducedMotion ? {} : { duration: 0.2 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {renderConditions.isTyping && (
          <AnimatedStateWrapper
            stateKey="typing"
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchTypingState query={query} />
          </AnimatedStateWrapper>
        )}

        {renderConditions.isLoading && (
          <AnimatedStateWrapper
            stateKey="loading"
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchLoadingState />
          </AnimatedStateWrapper>
        )}

        {renderConditions.hasError && (
          <AnimatedStateWrapper
            stateKey="error"
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchErrorState error={error!} onRetry={onRetry} />
          </AnimatedStateWrapper>
        )}

        {renderConditions.hasNoQuery && (
          <AnimatedStateWrapper
            stateKey="welcome"
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchWelcomeState onSuggestionClick={onSuggestionClick} />
          </AnimatedStateWrapper>
        )}

        {renderConditions.isEmpty && (
          <AnimatedStateWrapper
            stateKey="empty"
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchEmptyState query={query} onNewSearch={onNewSearch} />
          </AnimatedStateWrapper>
        )}

        {renderConditions.hasResults && (
          <AnimatedStateWrapper
            stateKey={`success-${query}`}
            prefersReducedMotion={prefersReducedMotion}
          >
            <SearchSuccessState
              query={query}
              items={pageItems}
              onViewDetails={onViewDetails}
            />
          </AnimatedStateWrapper>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchContent;
