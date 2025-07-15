import { useState, useCallback, useRef } from 'react';
import {
  fetchSfiaJobDetailByCode,
  fetchTpqiUnitDetailByCode,
  fetchMultipleCompetencyDetails,
  SfiaJobResponse,
  TpqiUnitResponse,
  APIError,
  isNetworkError,
  isTimeoutError,
  isNotFoundError,
} from '../services/competencyDetailAPI';

// Types for the hook
export interface CompetencyDetailState {
  data: SfiaJobResponse | TpqiUnitResponse | null;
  loading: boolean;
  error: APIError | null;
  lastFetched: Date | null;
}

export interface MultipleCompetencyDetailState {
  results: Array<{
    source: "sfia" | "tpqi";
    code: string;
    data?: SfiaJobResponse | TpqiUnitResponse;
    error?: APIError;
  }>;
  loading: boolean;
  error: APIError | null;
  totalRequests: number;
  completedRequests: number;
}

export interface UseCompetencyDetailOptions {
  // Cache duration in milliseconds (default: 5 minutes)
  cacheDuration?: number;
  // Maximum retry attempts on failure (default: 3)
  maxRetries?: number;
  // Retry delay in milliseconds (default: 1000ms)
  retryDelay?: number;
  // Auto-retry on network errors (default: true)
  autoRetryOnNetworkError?: boolean;
}

const DEFAULT_OPTIONS: Required<UseCompetencyDetailOptions> = {
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  autoRetryOnNetworkError: true,
};

/**
 * Custom hook for managing competency detail API calls
 * Provides state management, caching, retry logic, and error handling
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
  const [multipleState, setMultipleState] = useState<MultipleCompetencyDetailState>({
    results: [],
    loading: false,
    error: null,
    totalRequests: 0,
    completedRequests: 0,
  });

  // Cache for storing fetched data
  const cacheRef = useRef<Map<string, {
    data: SfiaJobResponse | TpqiUnitResponse;
    timestamp: number;
  }>>(new Map());

  // Retry attempts tracking
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());

  /**
   * Generate cache key for a competency request
   */
  const getCacheKey = useCallback((source: "sfia" | "tpqi", code: string): string => {
    return `${source}:${code.toLowerCase()}`;
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < opts.cacheDuration;
  }, [opts.cacheDuration]);

  /**
 * Get data from cache if available and valid
   */
  const getFromCache = useCallback((source: "sfia" | "tpqi", code: string): SfiaJobResponse | TpqiUnitResponse | null => {
    const cacheKey = getCacheKey(source, code);
    const cached = cacheRef.current.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      cacheRef.current.delete(cacheKey);
    }
    
    return null;
  }, [getCacheKey, isCacheValid]);

  /**
   * Store data in cache
   */
  const setCache = useCallback((
    source: "sfia" | "tpqi",
    code: string,
    data: SfiaJobResponse | TpqiUnitResponse
  ): void => {
    const cacheKey = getCacheKey(source, code);
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }, [getCacheKey]);

  /**
   * Sleep utility for retry delays
   */
  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  /**
   * Retry logic with exponential backoff
   */
  const shouldRetry = useCallback((error: APIError, retryCount: number): boolean => {
    if (retryCount >= opts.maxRetries) {
      return false;
    }

    // Always retry on network/timeout errors if auto-retry is enabled
    if (opts.autoRetryOnNetworkError && (isNetworkError(error) || isTimeoutError(error))) {
      return true;
    }

    // Don't retry on 404 or client errors (4xx)
    if (isNotFoundError(error) || (error.status && error.status >= 400 && error.status < 500)) {
      return false;
    }

    // Retry on server errors (5xx) or unknown errors
    return !error.status || error.status >= 500;
  }, [opts.maxRetries, opts.autoRetryOnNetworkError]);

  /**
   * Fetch SFIA job detail with retry logic
   */
  const fetchSfiaDetail = useCallback(async (jobCode: string): Promise<void> => {
    const cacheKey = getCacheKey("sfia", jobCode);
    
    // Check cache first
    const cachedData = getFromCache("sfia", jobCode);
    if (cachedData) {
      setState({
        data: cachedData,
        loading: false,
        error: null,
        lastFetched: new Date(),
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    let retryCount = 0;
    let lastError: APIError;

    // Try initial call + retries
    for (let totalAttempts = 0; totalAttempts <= opts.maxRetries; totalAttempts++) {
      try {
        const data = await fetchSfiaJobDetailByCode(jobCode);
        
        // Store in cache
        setCache("sfia", jobCode, data);
        
        // Reset retry attempts
        retryAttemptsRef.current.delete(cacheKey);
        
        setState({
          data,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
        return;

      } catch (error) {
        lastError = error instanceof APIError ? error : new APIError('Unknown error occurred');
        
        // Update retry tracking
        retryAttemptsRef.current.set(cacheKey, totalAttempts + 1);

        // Check if we should retry (if this wasn't the last allowed attempt)
        if (totalAttempts < opts.maxRetries && shouldRetry(lastError, retryCount)) {
          retryCount++;
          const delay = opts.retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
          await sleep(delay);
          continue;
        }
        
        break;
      }
    }

    // All retries failed
    setState({
      data: null,
      loading: false,
      error: lastError!,
      lastFetched: new Date(),
    });
  }, [getCacheKey, getFromCache, setCache, opts.maxRetries, opts.retryDelay, shouldRetry, sleep]);

  /**
   * Fetch TPQI unit detail with retry logic
   */
  const fetchTpqiDetail = useCallback(async (unitCode: string): Promise<void> => {
    const cacheKey = getCacheKey("tpqi", unitCode);
    
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

    setState(prev => ({ ...prev, loading: true, error: null }));

    let retryCount = 0;
    let lastError: APIError;

    // Try initial call + retries
    for (let totalAttempts = 0; totalAttempts <= opts.maxRetries; totalAttempts++) {
      try {
        const data = await fetchTpqiUnitDetailByCode(unitCode);
        
        // Store in cache
        setCache("tpqi", unitCode, data);
        
        // Reset retry attempts
        retryAttemptsRef.current.delete(cacheKey);
        
        setState({
          data,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
        return;

      } catch (error) {
        lastError = error instanceof APIError ? error : new APIError('Unknown error occurred');
        
        // Update retry tracking
        retryAttemptsRef.current.set(cacheKey, totalAttempts + 1);

        // Check if we should retry (if this wasn't the last allowed attempt)
        if (totalAttempts < opts.maxRetries && shouldRetry(lastError, retryCount)) {
          retryCount++;
          const delay = opts.retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
          await sleep(delay);
          continue;
        }
        
        break;
      }
    }

    // All retries failed
    setState({
      data: null,
      loading: false,
      error: lastError!,
      lastFetched: new Date(),
    });
  }, [getCacheKey, getFromCache, setCache, opts.maxRetries, opts.retryDelay, shouldRetry, sleep]);

  /**
   * Fetch multiple competency details in parallel
   */
  const fetchMultipleDetails = useCallback(async (
    requests: Array<{ source: "sfia" | "tpqi"; code: string }>
  ): Promise<void> => {
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
        data?: SfiaJobResponse | TpqiUnitResponse;
        error?: APIError;
      }> = [];

      const uncachedRequests: Array<{ source: "sfia" | "tpqi"; code: string }> = [];

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
      const fetchResults = await fetchMultipleCompetencyDetails(uncachedRequests);
      
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
      const apiError = error instanceof APIError ? error : new APIError('Failed to fetch multiple competency details');
      setMultipleState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, [getFromCache, setCache]);

  /**
   * Clear cache for specific competency or all cache
   */
  const clearCache = useCallback((source?: "sfia" | "tpqi", code?: string): void => {
    if (source && code) {
      const cacheKey = getCacheKey(source, code);
      cacheRef.current.delete(cacheKey);
      retryAttemptsRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
      retryAttemptsRef.current.clear();
    }
  }, [getCacheKey]);

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
  }, []);

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
  const getRetryAttempts = useCallback((source: "sfia" | "tpqi", code: string): number => {
    const cacheKey = getCacheKey(source, code);
    return retryAttemptsRef.current.get(cacheKey) || 0;
  }, [getCacheKey]);

  /**
   * Check if data exists in cache (without retrieving it)
   */
  const isInCache = useCallback((source: "sfia" | "tpqi", code: string): boolean => {
    const cacheKey = getCacheKey(source, code);
    const cached = cacheRef.current.get(cacheKey);
    return cached ? isCacheValid(cached.timestamp) : false;
  }, [getCacheKey, isCacheValid]);

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
    multipleProgress: multipleState.totalRequests > 0 
      ? multipleState.completedRequests / multipleState.totalRequests 
      : 0,
  };
}

/**
 * Simplified hook for SFIA job details only
 */
export function useSfiaSkillDetail(options: UseCompetencyDetailOptions = {}) {
  const {
    state,
    fetchSfiaDetail,
    resetState,
    clearCache,
    isLoading,
    hasError,
    hasData,
    getRetryAttempts,
    isInCache,
  } = useCompetencyDetail(options);

  return {
    jobDetail: state.data as SfiaJobResponse | null,
    loading: isLoading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchJobDetail: fetchSfiaDetail,
    resetState,
    clearCache: (jobCode?: string) => clearCache("sfia", jobCode),
    getRetryAttempts: (jobCode: string) => getRetryAttempts("sfia", jobCode),
    isInCache: (jobCode: string) => isInCache("sfia", jobCode),
    hasError,
    hasData,
  };
}

/**
 * Simplified hook for TPQI unit details only
 */
export function useTpqiUnitDetail(options: UseCompetencyDetailOptions = {}) {
  const {
    state,
    fetchTpqiDetail,
    resetState,
    clearCache,
    isLoading,
    hasError,
    hasData,
    getRetryAttempts,
    isInCache,
  } = useCompetencyDetail(options);

  return {
    unitDetail: state.data as TpqiUnitResponse | null,
    loading: isLoading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchUnitDetail: fetchTpqiDetail,
    resetState,
    clearCache: (unitCode?: string) => clearCache("tpqi", unitCode),
    getRetryAttempts: (unitCode: string) => getRetryAttempts("tpqi", unitCode),
    isInCache: (unitCode: string) => isInCache("tpqi", unitCode),
    hasError,
    hasData,
  };
}

export default useCompetencyDetail;
