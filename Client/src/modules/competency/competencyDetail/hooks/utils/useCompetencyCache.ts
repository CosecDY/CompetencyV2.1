import { useCallback, useRef } from "react";
import { SfiaSkillResponse, TpqiUnitResponse } from "../../services/competencyDetailAPI";
import { CacheEntry, CompetencySource } from "../types";

/**
 * Custom hook for managing cache operations
 */
export function useCompetencyCache(cacheDuration: number) {
  // Cache for storing fetched data
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  /**
   * Generate cache key for a competency request
   */
  const getCacheKey = useCallback(
    (source: CompetencySource, code: string): string => {
      return `${source}:${code.toLowerCase()}`;
    },
    []
  );

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(
    (timestamp: number): boolean => {
      return Date.now() - timestamp < cacheDuration;
    },
    [cacheDuration]
  );

  /**
   * Get data from cache if available and valid
   */
  const getFromCache = useCallback(
    (source: CompetencySource, code: string): SfiaSkillResponse | TpqiUnitResponse | null => {
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
    },
    [getCacheKey, isCacheValid]
  );

  /**
   * Store data in cache
   */
  const setCache = useCallback(
    (source: CompetencySource, code: string, data: SfiaSkillResponse | TpqiUnitResponse): void => {
      const cacheKey = getCacheKey(source, code);
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    },
    [getCacheKey]
  );

  /**
   * Clear cache for specific competency or all cache
   */
  const clearCache = useCallback(
    (source?: CompetencySource, code?: string): void => {
      if (source && code) {
        const cacheKey = getCacheKey(source, code);
        cacheRef.current.delete(cacheKey);
      } else {
        cacheRef.current.clear();
      }
    },
    [getCacheKey]
  );

  /**
   * Check if data exists in cache (without retrieving it)
   */
  const isInCache = useCallback(
    (source: CompetencySource, code: string): boolean => {
      const cacheKey = getCacheKey(source, code);
      const cached = cacheRef.current.get(cacheKey);
      return cached ? isCacheValid(cached.timestamp) : false;
    },
    [getCacheKey, isCacheValid]
  );

  return {
    getFromCache,
    setCache,
    clearCache,
    isInCache,
    getCacheKey,
  };
}
