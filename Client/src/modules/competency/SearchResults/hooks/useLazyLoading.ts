// Client/src/pages/SearchResults/hooks/useLazyLoading.ts
import { useState, useEffect, useCallback, useRef } from "react";

interface UseLazyLoadingOptions<T = unknown> {
  items: T[];
  initialLoad?: number;
  loadMore?: number;
  threshold?: number;
}

interface UseLazyLoadingReturn<T = unknown> {
  displayedItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMoreItems: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
}

export const useLazyLoading = <T = unknown>({
  items,
  initialLoad = 10,
  loadMore = 5,
  threshold = 0.8,
}: UseLazyLoadingOptions<T>): UseLazyLoadingReturn<T> => {
  const [displayedCount, setDisplayedCount] = useState(initialLoad);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate derived state
  const displayedItems = items.slice(0, displayedCount);
  const hasMore = displayedCount < items.length;

  // Load more items function with smoother loading
  const loadMoreItems = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Shorter delay for smoother experience
    loadingTimeoutRef.current = setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + loadMore, items.length));
      setIsLoading(false);
    }, 150); // Reduced from 300ms to 150ms for smoother loading
  }, [isLoading, hasMore, loadMore, items.length]);

  // Reset function to go back to initial state
  const reset = useCallback(() => {
    setDisplayedCount(initialLoad);
    setIsLoading(false);

    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, [initialLoad]);

  // Intersection Observer setup with improved configuration
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMoreItems();
        }
      },
      {
        threshold,
        rootMargin: "100px", // Increased from 50px for earlier loading
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreItems, threshold]);

  // Reset displayed count when items change
  useEffect(() => {
    reset();
  }, [items, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMoreItems,
    sentinelRef,
    reset,
  };
};
