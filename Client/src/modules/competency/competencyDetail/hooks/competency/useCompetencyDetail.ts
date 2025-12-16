import { useState, useCallback } from "react";
import {
  fetchMultipleCompetencyDetails,
  SfiaSkillResponse,
  TpqiUnitResponse,
  APIError,
} from "../../services/competencyDetailAPI";
import {
  CompetencyDetailState,
  MultipleCompetencyDetailState,
  UseCompetencyDetailOptions,
  DEFAULT_OPTIONS,
  CompetencyRequest,
} from "../types";
import { useCompetencyCache } from "../utils/useCompetencyCache";
import { useRetryLogic } from "../utils/useRetryLogic";
import { useSfiaSkillDetail } from "./useSfiaSkillDetail";
import { useTpqiUnitDetail } from "./useTpqiUnitDetail";

/**
 * Custom hook for managing competency detail API calls
 * Provides state management, caching, retry logic, and error handling
 *
 * This is the main hook that combines SFIA and TPQI functionality
 * For single competency types, use useSfiaSkillDetail or useTpqiUnitDetail
 */
export function useCompetencyDetail(options: UseCompetencyDetailOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Single competency detail state
  const [state, setState] = useState<CompetencyDetailState>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  // Multiple competency details state
  const [multipleState, setMultipleState] =
    useState<MultipleCompetencyDetailState>({
      results: [],
      loading: false,
      error: null,
      totalRequests: 0,
      completedRequests: 0,
    });

  // Cache and retry utilities
  const {
    getFromCache,
    setCache,
    clearCache: clearCacheUtility,
    isInCache,
    getCacheKey,
  } = useCompetencyCache(opts.cacheDuration);
  const { getRetryAttempts: getRetryAttemptsUtility, clearRetryTracking } =
    useRetryLogic(
      opts.maxRetries,
      opts.retryDelay,
      opts.autoRetryOnNetworkError,
      getCacheKey
    );

  // Individual hooks for SFIA and TPQI
  const sfiaHook = useSfiaSkillDetail(options);
  const tpqiHook = useTpqiUnitDetail(options);

  /**
   * Fetch SFIA skill detail - delegates to specific hook
   */
  const fetchSfiaDetail = useCallback(
    async (skillCode: string): Promise<void> => {
      await sfiaHook.fetchSkillDetail(skillCode);
      // Update main state to reflect the SFIA hook state
      setState({
        data: sfiaHook.skillDetail,
        loading: sfiaHook.loading,
        error: sfiaHook.error,
        lastFetched: sfiaHook.lastFetched,
      });
    },
    [sfiaHook]
  );

  /**
   * Fetch TPQI unit detail - delegates to specific hook
   */
  const fetchTpqiDetail = useCallback(
    async (unitCode: string): Promise<void> => {
      await tpqiHook.fetchUnitDetail(unitCode);
      // Update main state to reflect the TPQI hook state
      setState({
        data: tpqiHook.unitDetail,
        loading: tpqiHook.loading,
        error: tpqiHook.error,
        lastFetched: tpqiHook.lastFetched,
      });
    },
    [tpqiHook]
  );

  /**
   * Fetch multiple competency details in parallel
   */
  const fetchMultipleDetails = useCallback(
    async (requests: CompetencyRequest[]): Promise<void> => {
      setMultipleState({
        results: [],
        loading: true,
        error: null,
        totalRequests: requests.length,
        completedRequests: 0,
      });

      try {
        // Check cache for all requests first
        const cachedResults: Array<{
          source: "sfia" | "tpqi";
          code: string;
          data?: SfiaSkillResponse | TpqiUnitResponse;
          error?: APIError;
        }> = [];

        const uncachedRequests: CompetencyRequest[] = [];

        for (const request of requests) {
          const cachedData = getFromCache(request.source, request.code);
          if (cachedData) {
            cachedResults.push({
              source: request.source,
              code: request.code,
              data: cachedData,
            });
          } else {
            uncachedRequests.push(request);
          }
        }

        // If all requests are cached, return immediately
        if (uncachedRequests.length === 0) {
          setMultipleState({
            results: cachedResults,
            loading: false,
            error: null,
            totalRequests: requests.length,
            completedRequests: requests.length,
          });
          return;
        }

        // Fetch uncached requests
        const fetchResults = await fetchMultipleCompetencyDetails(
          uncachedRequests
        );

        // Cache successful results
        for (const result of fetchResults) {
          if (result.data) {
            setCache(result.source, result.code, result.data);
          }
        }

        // Combine cached and fetched results
        const allResults = [...cachedResults, ...fetchResults];

        setMultipleState({
          results: allResults,
          loading: false,
          error: null,
          totalRequests: requests.length,
          completedRequests: requests.length,
        });
      } catch (error) {
        const apiError =
          error instanceof APIError
            ? error
            : new APIError("Failed to fetch multiple competency details");
        setMultipleState((prev) => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }
    },
    [getFromCache, setCache]
  );

  /**
   * Clear cache for specific competency or all cache
   */
  const clearCache = useCallback(
    (source?: "sfia" | "tpqi", code?: string): void => {
      clearCacheUtility(source, code);
      clearRetryTracking(source, code);
      // Also clear from individual hooks
      if (!source || source === "sfia") {
        sfiaHook.clearCache(code);
      }
      if (!source || source === "tpqi") {
        tpqiHook.clearCache(code);
      }
    },
    [clearCacheUtility, clearRetryTracking, sfiaHook, tpqiHook]
  );

  /**
   * Reset single competency state
   */
  const resetState = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
    sfiaHook.resetState();
    tpqiHook.resetState();
  }, [sfiaHook, tpqiHook]);

  /**
   * Reset multiple competency state
   */
  const resetMultipleState = useCallback((): void => {
    setMultipleState({
      results: [],
      loading: false,
      error: null,
      totalRequests: 0,
      completedRequests: 0,
    });
  }, []);

  /**
   * Get retry attempts for a specific competency
   */
  const getRetryAttempts = useCallback(
    (source: "sfia" | "tpqi", code: string): number => {
      return getRetryAttemptsUtility(source, code);
    },
    [getRetryAttemptsUtility]
  );

  return {
    // State
    state,
    multipleState,

    // Actions
    fetchSfiaDetail,
    fetchTpqiDetail,
    fetchMultipleDetails,

    // Utilities
    clearCache,
    resetState,
    resetMultipleState,
    getRetryAttempts,
    isInCache,

    // Computed values
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
    isMultipleLoading: multipleState.loading,
    hasMultipleError: !!multipleState.error,
    hasMultipleData: multipleState.results.length > 0,
    multipleProgress:
      multipleState.totalRequests > 0
        ? multipleState.completedRequests / multipleState.totalRequests
        : 0,

    // Access to individual hooks
    sfiaHook,
    tpqiHook,
  };
}

export default useCompetencyDetail;
