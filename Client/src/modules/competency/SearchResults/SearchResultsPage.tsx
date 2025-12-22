import React, { useCallback, useMemo, useTransition, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, LazyMotion, domAnimation, useReducedMotion } from "framer-motion";

import Layout from "@Layouts/Layout";
import { SearchHeader, SearchContent } from "./components";

// Hooks
import { useLazyCompetencyResults } from "./hooks/useCompetencyResults";

// Constants
const UI_CONSTANTS = {
  SEARCH_PLACEHOLDER: "พิมพ์คำค้นหา เช่น Software",
  TYPING_DELAY: 500, // Match your hook's DEBOUNCE_DELAY
} as const;

/**
 * Enhanced ResultsPage Component with Smooth UX/UI
 *
 * Features:
 * - Smooth animations with reduced motion support
 * - React 18 transitions for non-blocking UI updates
 * - Enhanced loading states with progress indicators
 * - Optimized skeleton loading with shimmer effects
 * - Lazy loading with intersection observer
 * - Performance optimizations with memoization
 * - Smooth scroll behavior
 * - Debounced search with typing indicators
 */
const ResultsPage: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE MANAGEMENT
  // ============================================================================

  const { query, searchTerm, setSearchTerm, allItems, loading, error, handleSearch } = useLazyCompetencyResults();

  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  // Add typing state to show immediate feedback during debounce
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  // ============================================================================
  // TYPING INDICATOR LOGIC
  // ============================================================================

  useEffect(() => {
    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    // If there's a search term, show typing indicator
    if (searchTerm && searchTerm.trim().length > 0) {
      setIsTyping(true);

      // Set timer to hide typing indicator after debounce delay
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, UI_CONSTANTS.TYPING_DELAY);

      setTypingTimer(timer);
    } else {
      setIsTyping(false);
    }

    // Cleanup
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [searchTerm]); // Remove typingTimer from dependencies to avoid infinite loop

  // ============================================================================
  // MEMOIZED VALUES FOR PERFORMANCE
  // ============================================================================

  const navigationConfig = useMemo(
    () => ({
      sfia: "/competency/sfia",
      tpqi: "/competency/tpqi",
      fallback: "/home",
    }),
    []
  );

  // Animation variants that respect user's motion preferences
  const pageVariants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: "easeOut",
        },
      },
      exit: {
        opacity: 0,
        y: -10,
        transition: {
          duration: 0.2,
          ease: "easeIn",
        },
      },
    };
  }, [prefersReducedMotion]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewDetails = useCallback(
    (itemId: string) => {
      const targetItem = allItems.find((item) => item.id === itemId);
      const framework = targetItem?.framework;

      console.debug(`Navigating to details for item: ${itemId}, framework: ${framework}`);

      switch (framework) {
        case "sfia":
          navigate(`${navigationConfig.sfia}/${itemId}`);
          break;
        case "tpqi":
          navigate(`${navigationConfig.tpqi}/${itemId}`);
          break;
        default:
          console.warn(`Unknown framework type: ${framework}, redirecting to home`);
          navigate(navigationConfig.fallback);
          break;
      }
    },
    [allItems, navigate, navigationConfig]
  );

  const handleRetry = useCallback(() => {
    const retryTerm = searchTerm.trim() || query;
    console.debug(`Retrying search with term: "${retryTerm}"`);
    handleSearch(retryTerm);
  }, [searchTerm, query, handleSearch]);

  const handleNewSearch = useCallback(() => {
    setSearchTerm("");
    handleSearch("");
  }, [setSearchTerm, handleSearch]);

  const handleSearchExecution = useCallback(
    (term: string) => {
      const searchInput = term || searchTerm;
      console.debug(`Executing search with term: "${searchInput}"`);

      // Use transition for smoother state updates
      startTransition(() => {
        handleSearch(searchInput);
      });
    },
    [searchTerm, handleSearch, startTransition]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      startTransition(() => {
        setSearchTerm(suggestion);
        handleSearch(suggestion);
      });
    },
    [setSearchTerm, handleSearch, startTransition]
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Layout>
      <LazyMotion features={domAnimation}>
        <motion.div className="flex-1 pt-24 pb-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-teal-50 via-teal-25 to-white" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.1,
              },
            }}
          >
            <SearchHeader searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearch={handleSearchExecution} placeholder={UI_CONSTANTS.SEARCH_PLACEHOLDER} query={query} />
          </motion.div>

          <motion.div
            className={`max-w-6xl mx-auto transition-opacity duration-200 ${isPending ? "opacity-70" : "opacity-100"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isPending ? 0.7 : 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.2,
              },
            }}
          >
            <SearchContent
              loading={loading || isPending}
              isTyping={isTyping}
              error={error}
              query={query}
              pageItems={allItems}
              onViewDetails={handleViewDetails}
              onRetry={handleRetry}
              onSuggestionClick={handleSuggestionClick}
              onNewSearch={handleNewSearch}
            />
          </motion.div>
        </motion.div>
      </LazyMotion>
    </Layout>
  );
};

export default ResultsPage;
