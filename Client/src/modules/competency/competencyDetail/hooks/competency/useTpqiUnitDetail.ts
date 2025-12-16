import { useState, useCallback } from "react";
import { fetchTpqiUnitDetailByCode, TpqiUnitResponse, APIError } from "../../services/competencyDetailAPI";
import { CompetencyDetailState, UseCompetencyDetailOptions, DEFAULT_OPTIONS } from "../types";
import { useCompetencyCache } from "../utils/useCompetencyCache";
import { useRetryLogic } from "../utils/useRetryLogic";

/**
 * Simplified hook for TPQI unit details only
 */
export function useTpqiUnitDetail(options: UseCompetencyDetailOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [state, setState] = useState<CompetencyDetailState>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  // Cache management
  const { getFromCache, setCache, clearCache: clearCacheUtility, isInCache, getCacheKey } = useCompetencyCache(opts.cacheDuration);

  // Retry logic
  const { executeWithRetry, getRetryAttempts: getRetryAttemptsUtility, clearRetryTracking } = useRetryLogic(opts.maxRetries, opts.retryDelay, opts.autoRetryOnNetworkError, getCacheKey);

  /**
   * Fetch TPQI unit detail with retry logic
   */
  const fetchUnitDetail = useCallback(
    async (unitCode: string): Promise<void> => {
      // Check cache first
      const cachedData = getFromCache("tpqi", unitCode);
      if (cachedData) {
        setState({
          data: cachedData,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await executeWithRetry(() => fetchTpqiUnitDetailByCode(unitCode), "tpqi", unitCode);

        // Store in cache
        setCache("tpqi", unitCode, data);

        setState({
          data,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError("Unknown error occurred");
        setState({
          data: null,
          loading: false,
          error: apiError,
          lastFetched: new Date(),
        });
      }
    },
    [getFromCache, setCache, executeWithRetry]
  );

  /**
   * Reset state
   */
  const resetState = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
  }, []);

  /**
   * Clear cache for specific unit code
   */
  const clearCache = useCallback(
    (unitCode?: string): void => {
      clearCacheUtility("tpqi", unitCode);
      if (unitCode) {
        clearRetryTracking("tpqi", unitCode);
      } else {
        clearRetryTracking();
      }
    },
    [clearCacheUtility, clearRetryTracking]
  );

  /**
   * Get retry attempts for a specific unit code
   */
  const getRetryAttempts = useCallback(
    (unitCode: string): number => {
      return getRetryAttemptsUtility("tpqi", unitCode);
    },
    [getRetryAttemptsUtility]
  );

  /**
   * Check if unit code is in cache
   */
  const isUnitInCache = useCallback(
    (unitCode: string): boolean => {
      return isInCache("tpqi", unitCode);
    },
    [isInCache]
  );

  return {
    unitDetail: state.data as TpqiUnitResponse | null,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchUnitDetail,
    resetState,
    clearCache,
    getRetryAttempts,
    isInCache: isUnitInCache,
    hasError: !!state.error,
    hasData: !!state.data,
  };
}
