import { useState, useCallback } from "react";
import { fetchSfiaSkillDetailByCode, SfiaSkillResponse, APIError } from "../../services/competencyDetailAPI";
import { CompetencyDetailState, UseCompetencyDetailOptions, DEFAULT_OPTIONS } from "../types";
import { useCompetencyCache } from "../utils/useCompetencyCache";
import { useRetryLogic } from "../utils/useRetryLogic";

/**
 * Simplified hook for SFIA skill details only
 */
export function useSfiaSkillDetail(options: UseCompetencyDetailOptions = {}) {
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
   * Fetch SFIA skill detail with retry logic
   */
  const fetchSkillDetail = useCallback(
    async (skillCode: string): Promise<void> => {
      // Check cache first
      const cachedData = getFromCache("sfia", skillCode);
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
        const data = await executeWithRetry(() => fetchSfiaSkillDetailByCode(skillCode), "sfia", skillCode);

        // Store in cache
        setCache("sfia", skillCode, data);

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
   * Clear cache for specific skill code
   */
  const clearCache = useCallback(
    (skillCode?: string): void => {
      clearCacheUtility("sfia", skillCode);
      if (skillCode) {
        clearRetryTracking("sfia", skillCode);
      } else {
        clearRetryTracking();
      }
    },
    [clearCacheUtility, clearRetryTracking]
  );

  /**
   * Get retry attempts for a specific skill code
   */
  const getRetryAttempts = useCallback(
    (skillCode: string): number => {
      return getRetryAttemptsUtility("sfia", skillCode);
    },
    [getRetryAttemptsUtility]
  );

  /**
   * Check if skill code is in cache
   */
  const isSkillInCache = useCallback(
    (skillCode: string): boolean => {
      return isInCache("sfia", skillCode);
    },
    [isInCache]
  );

  return {
    skillDetail: state.data as SfiaSkillResponse | null,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchSkillDetail,
    resetState,
    clearCache,
    getRetryAttempts,
    isInCache: isSkillInCache,
    hasError: !!state.error,
    hasData: !!state.data,
  };
}
