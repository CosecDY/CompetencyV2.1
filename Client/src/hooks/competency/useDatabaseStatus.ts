import { useState, useEffect, useCallback } from "react";
import { getDatabaseHealth, getSystemHealth, DatabaseHealthResponse, SystemHealthResponse, DatabaseHealthError, isNetworkError, isTimeoutError } from "@Services/databaseHealthAPI";

/**
 * Database Status Hook State Interface
 */
interface DatabaseStatusState {
  // Health data
  systemHealth: SystemHealthResponse | null;
  databaseHealth: DatabaseHealthResponse | null;

  // Loading states
  loading: boolean;
  refreshing: boolean;

  // Error state
  error: string | null;

  // Last update timestamp
  lastUpdated: Date | null;

  // Auto-refresh enabled
  autoRefreshEnabled: boolean;
}

/**
 * Hook configuration options
 */
interface UseDatabaseStatusOptions {
  autoRefreshInterval?: number; // milliseconds
  enableAutoRefresh?: boolean;
  onError?: (error: DatabaseHealthError) => void;
  onStatusChange?: (status: "healthy" | "degraded" | "unhealthy") => void;
}

/**
 * Custom hook for managing database status monitoring
 *
 * Features:
 * - Real-time database health monitoring
 * - Auto-refresh with configurable intervals
 * - Error handling with retry logic
 * - Network error detection
 * - Loading states for different operations
 *
 * @param options - Configuration options for the hook
 * @returns Hook state and control functions
 */
export function useDatabaseStatus(options: UseDatabaseStatusOptions = {}) {
  const {
    autoRefreshInterval = 30000, // 30 seconds default
    enableAutoRefresh = true,
    onError,
    onStatusChange,
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<DatabaseStatusState>({
    systemHealth: null,
    databaseHealth: null,
    loading: false,
    refreshing: false,
    error: null,
    lastUpdated: null,
    autoRefreshEnabled: enableAutoRefresh,
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Handle and format errors from health check APIs
   */
  const handleError = useCallback(
    (error: unknown, context: string) => {
      let errorMessage = "เกิดข้อผิดพลาดในการตรวจสอบสถานะระบบ";

      if (error instanceof DatabaseHealthError) {
        if (isNetworkError(error.originalError)) {
          errorMessage = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
        } else if (isTimeoutError(error.originalError)) {
          errorMessage = "การตรวจสอบสถานะระบบใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";
        } else {
          errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(`Database status error (${context}):`, error);

      setState((prev) => ({ ...prev, error: errorMessage, loading: false, refreshing: false }));

      if (onError && error instanceof DatabaseHealthError) {
        onError(error);
      }
    },
    [onError]
  );

  // ============================================================================
  // HEALTH CHECK FUNCTIONS
  // ============================================================================

  /**
   * Fetch complete health status (system + database)
   */
  const fetchHealthStatus = useCallback(
    async (isRefresh = false) => {
      setState((prev) => ({
        ...prev,
        loading: !isRefresh,
        refreshing: isRefresh,
        error: null,
      }));

      try {
        // Fetch both system and database health in parallel
        const [systemHealth, databaseHealth] = await Promise.all([getSystemHealth(), getDatabaseHealth()]);

        setState((prev) => ({
          ...prev,
          systemHealth,
          databaseHealth,
          loading: false,
          refreshing: false,
          error: null,
          lastUpdated: new Date(),
        }));

        // Notify status change if callback is provided
        if (onStatusChange) {
          onStatusChange(databaseHealth.status);
        }
      } catch (error) {
        handleError(error, isRefresh ? "refresh" : "initial_load");
      }
    },
    [handleError, onStatusChange]
  );

  /**
   * Refresh health status (for manual refresh)
   */
  const refreshStatus = useCallback(() => {
    fetchHealthStatus(true);
  }, [fetchHealthStatus]);

  /**
   * Toggle auto-refresh functionality
   */
  const toggleAutoRefresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      autoRefreshEnabled: !prev.autoRefreshEnabled,
    }));
  }, []);

  // ============================================================================
  // AUTO-REFRESH EFFECT
  // ============================================================================

  useEffect(() => {
    if (!state.autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchHealthStatus(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefreshEnabled, autoRefreshInterval, fetchHealthStatus]);

  // ============================================================================
  // INITIAL LOAD EFFECT
  // ============================================================================

  useEffect(() => {
    fetchHealthStatus(false);
  }, [fetchHealthStatus]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isSystemHealthy = state.systemHealth?.status === "healthy";
  const overallStatus = state.databaseHealth?.status || "unknown";
  const hasData = state.systemHealth !== null && state.databaseHealth !== null;

  const databaseSummary = state.databaseHealth
    ? {
        total: state.databaseHealth.summary.total,
        healthy: state.databaseHealth.summary.healthy,
        unhealthy: state.databaseHealth.summary.unhealthy,
        unknown: state.databaseHealth.summary.unknown,
        healthyPercentage: Math.round((state.databaseHealth.summary.healthy / state.databaseHealth.summary.total) * 100),
      }
    : null;

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Current state
    ...state,

    // Computed values
    isSystemHealthy,
    overallStatus,
    hasData,
    databaseSummary,

    // Actions
    refreshStatus,
    toggleAutoRefresh,

    // Individual database status helpers
    isDatabaseHealthy: (dbName: keyof DatabaseHealthResponse["databases"]) => state.databaseHealth?.databases[dbName]?.status === "healthy",

    getDatabaseLatency: (dbName: keyof DatabaseHealthResponse["databases"]) => state.databaseHealth?.databases[dbName]?.latency,

    getDatabaseError: (dbName: keyof DatabaseHealthResponse["databases"]) => state.databaseHealth?.databases[dbName]?.error,
  };
}
