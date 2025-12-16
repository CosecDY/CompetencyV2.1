import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatabaseStatus } from "@Hooks/competency/useDatabaseStatus";

/**
 * Database Status Component Props
 */
interface DatabaseStatusProps {
  /** Whether to show detailed information */
  showDetails?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Whether to show refresh button */
  showRefreshButton?: boolean;
  /** Whether to show auto-refresh toggle */
  showAutoRefreshToggle?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Status Badge Component
 */
interface StatusBadgeProps {
  status: "healthy" | "unhealthy" | "unknown";
  label: string;
  latency?: number;
  error?: string;
  compact?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, latency, error, compact = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "unhealthy":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "✅";
      case "unhealthy":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div
      className={`inline-flex items-center ${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} 
                     font-medium rounded-full border ${getStatusColor(status)}`}
    >
      <span className="mr-1">{getStatusIcon(status)}</span>
      <span>{label}</span>
      {latency && status === "healthy" && <span className="ml-1 text-xs opacity-75">({latency}ms)</span>}
      {error && compact && (
        <span className="ml-1 text-xs opacity-75" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
};

/**
 * Database Status Component
 *
 * Displays real-time database connection status with options for:
 * - Compact or detailed view
 * - Manual refresh capability
 * - Auto-refresh toggle
 * - Individual database status
 * - Error handling and display
 */
export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ showDetails = false, className = "", showRefreshButton = true, showAutoRefreshToggle = false, compact = false }) => {
  const {
    databaseHealth,
    loading,
    refreshing,
    error,
    lastUpdated,
    autoRefreshEnabled,
    overallStatus,
    databaseSummary,
    hasData,
    refreshStatus,
    toggleAutoRefresh,
    isDatabaseHealthy,
    getDatabaseLatency,
    getDatabaseError,
  } = useDatabaseStatus();

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverallStatus = () => {
    const getOverallStatusColor = () => {
      switch (overallStatus) {
        case "healthy":
          return "text-green-600";
        case "degraded":
          return "text-yellow-600";
        case "unhealthy":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    };

    const getOverallStatusText = () => {
      switch (overallStatus) {
        case "healthy":
          return "ระบบฐานข้อมูลทำงานปกติ";
        case "degraded":
          return "ระบบฐานข้อมูลมีปัญหาบางส่วน";
        case "unhealthy":
          return "ระบบฐานข้อมูลมีปัญหา";
        default:
          return "ไม่สามารถตรวจสอบสถานะได้";
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <div className={`font-medium ${getOverallStatusColor()}`}>{getOverallStatusText()}</div>
        {databaseSummary && (
          <div className="text-sm text-gray-600">
            ({databaseSummary.healthy}/{databaseSummary.total} ฐานข้อมูล)
          </div>
        )}
      </div>
    );
  };

  const renderDatabaseDetails = () => {
    if (!databaseHealth) return null;

    const databases = [
      { key: "sfia" as const, label: "SFIA" },
      { key: "tpqi" as const, label: "TPQI" },
      { key: "competency" as const, label: "Competency" },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {databases.map(({ key, label }) => {
          const status = isDatabaseHealthy(key) ? "healthy" : "unhealthy";
          const latency = getDatabaseLatency(key);
          const dbError = getDatabaseError(key);

          return (
            <div key={key} className="p-3 bg-gray-50 rounded-lg">
              <StatusBadge status={status} label={label} latency={latency} error={dbError} compact={compact} />
              {dbError && !compact && <div className="mt-2 text-xs text-red-600">{dbError}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderControls = () => (
    <div className="flex items-center space-x-3">
      {showRefreshButton && (
        <button
          onClick={refreshStatus}
          disabled={refreshing}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 
                     bg-white border border-gray-300 rounded-md hover:bg-gray-50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }} className="mr-2">
            🔄
          </motion.div>
          {refreshing ? "กำลังตรวจสอบ..." : "ตรวจสอบใหม่"}
        </button>
      )}

      {showAutoRefreshToggle && (
        <button
          onClick={toggleAutoRefresh}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md 
                     border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     ${autoRefreshEnabled ? "text-indigo-700 bg-indigo-100 border-indigo-300 hover:bg-indigo-200" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}
        >
          {autoRefreshEnabled ? "🟢" : "⚪"} อัพเดทอัตโนมัติ
        </button>
      )}
    </div>
  );

  const renderLastUpdated = () => {
    if (!lastUpdated) return null;

    return <div className="text-xs text-gray-500">อัพเดทล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</div>;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`database-status ${className}`}>
      <AnimatePresence mode="wait">
        {loading && !hasData && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-lg">
                ⚙️
              </motion.div>
              <span className="text-gray-600">กำลังตรวจสอบสถานะระบบ...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {hasData && !loading && (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-3">
            {/* Overall Status */}
            {renderOverallStatus()}

            {/* Database Details */}
            {showDetails && renderDatabaseDetails()}

            {/* Controls and Last Updated */}
            <div className="flex items-center justify-between pt-2">
              {(showRefreshButton || showAutoRefreshToggle) && renderControls()}
              {renderLastUpdated()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatabaseStatus;
