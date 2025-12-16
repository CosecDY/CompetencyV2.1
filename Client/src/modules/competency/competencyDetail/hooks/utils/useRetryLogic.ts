import { useCallback, useRef } from "react";
import {
  APIError,
  isNetworkError,
  isTimeoutError,
  isNotFoundError,
} from "../../services/competencyDetailAPI";
import { CompetencySource } from "../types";

/**
 * Custom hook for managing retry logic
 */
export function useRetryLogic(
  maxRetries: number,
  retryDelay: number,
  autoRetryOnNetworkError: boolean,
  getCacheKey: (source: CompetencySource, code: string) => string
) {
  // Retry attempts tracking
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());

  /**
   * Sleep utility for retry delays
   */
  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }, []);

  /**
   * Retry logic with exponential backoff
   */
  const shouldRetry = useCallback(
    (error: APIError, retryCount: number): boolean => {
      if (retryCount >= maxRetries) {
        return false;
      }

      // Always retry on network/timeout errors if auto-retry is enabled
      if (
        autoRetryOnNetworkError &&
        (isNetworkError(error) || isTimeoutError(error))
      ) {
        return true;
      }

      // Don't retry on 404 or client errors (4xx)
      if (
        isNotFoundError(error) ||
        (error.status && error.status >= 400 && error.status < 500)
      ) {
        return false;
      }

      // Retry on server errors (5xx) or unknown errors
      return !error.status || error.status >= 500;
    },
    [maxRetries, autoRetryOnNetworkError]
  );

  /**
   * Execute an async operation with retry logic
   */
  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      source: CompetencySource,
      code: string
    ): Promise<T> => {
      const cacheKey = getCacheKey(source, code);
      let lastError: APIError = new APIError(
        "No error occurred during retries"
      );

      // Try initial call + retries
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await operation();

          // Reset retry attempts on success
          retryAttemptsRef.current.delete(cacheKey);

          return result;
        } catch (error) {
          lastError =
            error instanceof APIError
              ? error
              : new APIError("Unknown error occurred");

          // Update retry tracking
          retryAttemptsRef.current.set(cacheKey, attempt + 1);

          // Check if we should retry (if this wasn't the last allowed attempt)
          if (attempt < maxRetries && shouldRetry(lastError, attempt)) {
            const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
            await sleep(delay);
            continue;
          }

          break;
        }
      }

      // All retries failed
      throw lastError;
    },
    [maxRetries, retryDelay, shouldRetry, sleep, getCacheKey]
  );

  /**
   * Get retry attempts for a specific competency
   */
  const getRetryAttempts = useCallback(
    (source: CompetencySource, code: string): number => {
      const cacheKey = getCacheKey(source, code);
      return retryAttemptsRef.current.get(cacheKey) || 0;
    },
    [getCacheKey]
  );

  /**
   * Clear retry tracking
   */
  const clearRetryTracking = useCallback(
    (source?: CompetencySource, code?: string): void => {
      if (source && code) {
        const cacheKey = getCacheKey(source, code);
        retryAttemptsRef.current.delete(cacheKey);
      } else {
        retryAttemptsRef.current.clear();
      }
    },
    [getCacheKey]
  );

  return {
    executeWithRetry,
    getRetryAttempts,
    clearRetryTracking,
    shouldRetry,
    sleep,
  };
}
