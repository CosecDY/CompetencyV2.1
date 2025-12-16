import React, { useMemo, useCallback, JSX } from "react";
import { motion } from "framer-motion";

interface SearchErrorStateProps {
  error: string;
  onRetry: () => void;
}

// Enhanced error types with specific handling
type ErrorType =
  | "network"
  | "validation"
  | "database"
  | "timeout"
  | "server"
  | "rateLimit"
  | "permission"
  | "unknown";

interface ErrorConfig {
  icon: JSX.Element;
  guidance: string;
  retryable: boolean;
  severity: "low" | "medium" | "high";
  color: string;
}

// Enhanced error detection with more comprehensive patterns
const detectErrorType = (error: string): ErrorType => {
  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("เครือข่าย") ||
    lowerError.includes("เชื่อมต่อ") ||
    lowerError.includes("network") ||
    lowerError.includes("connection")
  )
    return "network";

  if (
    lowerError.includes("อย่างน้อย") ||
    lowerError.includes("ตัวอักษร") ||
    lowerError.includes("ยาวเกินไป") ||
    lowerError.includes("validation")
  )
    return "validation";

  if (lowerError.includes("ฐานข้อมูล") || lowerError.includes("database"))
    return "database";

  if (
    lowerError.includes("หมดเวลา") ||
    lowerError.includes("ใช้เวลานานเกินไป") ||
    lowerError.includes("timeout")
  )
    return "timeout";

  if (
    lowerError.includes("เซิร์ฟเวอร์") ||
    lowerError.includes("ระบบ") ||
    lowerError.includes("server") ||
    lowerError.includes("500")
  )
    return "server";

  if (lowerError.includes("บ่อยเกินไป") || lowerError.includes("rate limit"))
    return "rateLimit";

  if (
    lowerError.includes("ไม่ได้รับอนุญาต") ||
    lowerError.includes("permission") ||
    lowerError.includes("unauthorized")
  )
    return "permission";

  return "unknown";
};

// Comprehensive error configurations
const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  network: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    ),
    guidance: "โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณและลองใหม่อีกครั้ง",
    retryable: true,
    severity: "high",
    color: "red",
  },
  validation: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    guidance: "กรุณาแก้ไขคำค้นหาของคุณตามข้อกำหนดแล้วลองใหม่",
    retryable: true,
    severity: "low",
    color: "amber",
  },
  database: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
        />
      </svg>
    ),
    guidance: "ฐานข้อมูลกำลังมีปัญหาชั่วคราว กรุณารอสักครู่แล้วลองใหม่",
    retryable: true,
    severity: "medium",
    color: "orange",
  },
  timeout: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    guidance:
      "การค้นหาใช้เวลานานกว่าปกติ ลองใช้คำค้นหาที่สั้นกว่าหรือเฉพาะเจาะจงมากขึ้น",
    retryable: true,
    severity: "medium",
    color: "blue",
  },
  server: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    guidance:
      "เซิร์ฟเวอร์กำลังมีปัญหา กรุณาลองใหม่ในภายหลัง หรือติดต่อผู้ดูแลระบบ",
    retryable: true,
    severity: "high",
    color: "red",
  },
  rateLimit: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    guidance: "คุณค้นหาบ่อยเกินไป โปรดรอสักครู่ก่อนค้นหาอีกครั้ง",
    retryable: false,
    severity: "medium",
    color: "purple",
  },
  permission: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    guidance: "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้ กรุณาติดต่อผู้ดูแลระบบ",
    retryable: false,
    severity: "high",
    color: "red",
  },
  unknown: {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    guidance:
      "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ",
    retryable: true,
    severity: "medium",
    color: "gray",
  },
};

/**
 * Enhanced SearchErrorState Component with Intelligent Error Handling
 *
 * Features:
 * - Smart error type detection and categorization
 * - Context-aware guidance and recovery suggestions
 * - Severity-based visual styling
 * - Progressive retry mechanisms
 * - Accessibility improvements
 */
const SearchErrorState: React.FC<SearchErrorStateProps> = ({
  error,
  onRetry,
}) => {
  // Memoized error analysis for performance
  const errorAnalysis = useMemo(() => {
    const errorType = detectErrorType(error);
    const config = ERROR_CONFIGS[errorType];
    return { errorType, config };
  }, [error]);

  const { errorType, config } = errorAnalysis;

  // Enhanced retry handler with progressive backoff suggestion
  const handleRetry = useCallback(() => {
    if (config.retryable) {
      onRetry();
    }
  }, [config.retryable, onRetry]);

  // Enhanced refresh handler
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Color scheme based on error severity
  const colorScheme = useMemo(() => {
    const colors = {
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-600",
        iconBg: "bg-red-100",
      },
      amber: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        iconBg: "bg-orange-100",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600",
        iconBg: "bg-purple-100",
      },
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-600",
        iconBg: "bg-gray-100",
      },
    };
    return colors[config.color as keyof typeof colors] || colors.gray;
  }, [config.color]);

  // Helper function for severity badge color
  const getSeverityBadgeColor = useCallback((severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  }, []);

  return (
    <motion.div
      key={`error-${errorType}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center py-12"
    >
      <div
        className={`inline-flex flex-col items-center space-y-6 p-8 ${colorScheme.bg} backdrop-blur-sm rounded-2xl shadow-lg ${colorScheme.border} border max-w-md mx-auto`}
      >
        {/* Error Icon with Severity Indicator */}
        <div className={`relative p-4 ${colorScheme.iconBg} rounded-full`}>
          <div className={colorScheme.text}>{config.icon}</div>
          {/* Severity Badge */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getSeverityBadgeColor(
              config.severity
            )} border-2 border-white`}
          />
        </div>

        {/* Error Information */}
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            เกิดข้อผิดพลาด
          </h3>

          {/* Error Message */}
          <div className="space-y-2">
            <p className="text-gray-700 font-medium text-sm bg-white/50 px-3 py-2 rounded-lg border border-gray-100">
              {error}
            </p>

            {/* Error Type Badge */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorScheme.iconBg} ${colorScheme.text} border ${colorScheme.border}`}
              >
                ประเภท: {errorType}
              </span>
            </div>
          </div>

          {/* Guidance */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {config.guidance}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 w-full">
          {config.retryable && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="ลองใหม่อีกครั้ง"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              ลองใหม่อีกครั้ง
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 text-sm"
            aria-label="รีเฟรชหน้าเว็บ"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            รีเฟรชหน้าเว็บ
          </button>

          {/* Additional Recovery Options for High Severity Errors */}
          {config.severity === "high" && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                ตัวเลือกเพิ่มเติม:
              </p>
              <div className="flex flex-col space-y-1 text-xs">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="text-left text-teal-600 hover:text-teal-700 transition-colors"
                >
                  • กลับไปหน้าหลัก
                </button>
                <a
                  href="mailto:support@example.com"
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                >
                  • ติดต่อฝ่ายสนับสนุน
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Error Timestamp for Debugging */}
        <div className="text-xs text-gray-400 text-center">
          เวลาที่เกิดข้อผิดพลาด: {new Date().toLocaleString("th-TH")}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchErrorState;
