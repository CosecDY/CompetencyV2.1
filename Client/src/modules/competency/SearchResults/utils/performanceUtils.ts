/**
 * @fileoverview Performance optimization utilities for search UI
 * @author Siriwat Chairak
 * @version 2.1.0
 * @since 2025-08-04
 */

import { useCallback, useRef, useEffect, useState } from "react";

/**
 * Hook for debouncing search input to reduce unnecessary API calls
 * @param callback - Function to call after debounce delay
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 */
export const useDebounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Hook for smooth scroll behavior with performance optimization
 * @param behavior - Scroll behavior type
 * @returns Optimized scroll function
 */
export const useSmoothScroll = (behavior: "smooth" | "instant" = "smooth") => {
  return useCallback(
    (top: number = 0, left: number = 0) => {
      if (typeof window !== "undefined") {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          window.scrollTo({
            top,
            left,
            behavior:
              behavior === "smooth" &&
              !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "smooth"
                : "instant",
          });
        });
      }
    },
    [behavior]
  );
};

/**
 * Hook for optimizing component re-renders during search
 * @param items - Array of search result items
 * @param pageSize - Number of items per page
 * @returns Optimized pagination data
 */
export const useSearchPagination = <T>(items: T[], pageSize: number = 12) => {
  const totalPages = Math.ceil(items.length / pageSize);

  const getPageItems = useCallback(
    (page: number) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return items.slice(startIndex, endIndex);
    },
    [items, pageSize]
  );

  return {
    totalPages,
    pageSize,
    totalItems: items.length,
    getPageItems,
  };
};

/**
 * Performance monitoring hook for search operations
 * @param label - Label for the performance measurement
 * @returns Functions to start and end performance measurement
 */
export const usePerformanceMonitor = (label: string) => {
  const startTime = useRef<number | undefined>(undefined);

  const startMeasure = useCallback(() => {
    if (typeof performance !== "undefined") {
      startTime.current = performance.now();
    }
  }, []);

  const endMeasure = useCallback(() => {
    if (typeof performance !== "undefined" && startTime.current) {
      const duration = performance.now() - startTime.current;
      console.debug(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }
  }, [label]);

  return { startMeasure, endMeasure };
};

/**
 * Hook for optimizing image loading in search results
 * @returns Image loading optimization utilities
 */
export const useImageOptimization = () => {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (imageCache.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.current.set(src, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(
    (sources: string[]) => {
      return Promise.allSettled(sources.map(preloadImage));
    },
    [preloadImage]
  );

  return { preloadImage, preloadImages };
};

/**
 * Hook for managing loading states with smooth transitions
 * @param initialState - Initial loading state
 * @returns Loading state management utilities
 */
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startLoading = useCallback((estimatedDuration?: number) => {
    setIsLoading(true);
    setLoadingProgress(0);

    if (estimatedDuration) {
      // Simulate progress for better UX
      const interval = 100; // Update every 100ms
      const step = (interval / estimatedDuration) * 100;

      const updateProgress = () => {
        setLoadingProgress((prev) => {
          const next = Math.min(prev + step + Math.random() * 5, 90);

          if (next < 90) {
            timeoutRef.current = setTimeout(updateProgress, interval);
          }

          return next;
        });
      };

      updateProgress();
    }
  }, []);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 200); // Small delay for smooth completion animation
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    loadingProgress,
    startLoading,
    stopLoading,
  };
};

// Fix missing import
