import { useState, useCallback, useMemo } from "react";
import { APIError, isNetworkError, isTimeoutError, isNotFoundError } from "../../services/competencyDetailAPI";

// Type aliases to fix union type issues
type CompetencySource = "sfia" | "tpqi";
type ErrorType = "network" | "timeout" | "notFound" | "validation" | "server" | "unknown";
type ErrorInput = APIError | Error | string | null | undefined;

// Types for error handling
export interface ErrorInfo {
  message: string;
  type: ErrorType;
  status?: number;
  source?: CompetencySource;
  code?: string;
  retryable: boolean;
  timestamp: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Hook for error handling and validation related to competency details
 */
export function useCompetencyDetailError() {
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);

  /**
   * Determine error type from APIError
   */
  const getErrorType = useCallback((error: APIError): ErrorType => {
    if (isNetworkError(error)) return "network";
    if (isTimeoutError(error)) return "timeout";
    if (isNotFoundError(error)) return "notFound";
    if (error.status && error.status >= 500) return "server";
    return "unknown";
  }, []);

  /**
   * Parse an APIError into a more detailed ErrorInfo object
   */
  const parseError = useCallback(
    (error: ErrorInput, source?: CompetencySource, code?: string): ErrorInfo => {
      const defaultErrorInfo: ErrorInfo = {
        message: "An unknown error occurred",
        type: "unknown",
        retryable: false,
        timestamp: new Date(),
      };

      if (error instanceof APIError) {
        const type = getErrorType(error);
        return {
          message: error.message,
          type,
          status: error.status,
          source: (error.source as CompetencySource) || source,
          code,
          retryable: type === "network" || type === "timeout" || type === "server",
          timestamp: new Date(),
        };
      }

      if (error instanceof Error) {
        return {
          ...defaultErrorInfo,
          message: error.message,
          source,
          code,
        };
      }

      if (typeof error === "string") {
        return {
          ...defaultErrorInfo,
          message: error,
          source,
          code,
        };
      }

      return defaultErrorInfo;
    },
    [getErrorType]
  );

  /**
   * Add an error to the history
   */
  const addError = useCallback(
    (error: ErrorInput, source?: CompetencySource, code?: string): ErrorInfo => {
      const errorInfo = parseError(error, source, code);
      setErrorHistory((prev) => [errorInfo, ...prev.slice(0, 49)]); // Keep last 50 errors
      return errorInfo;
    },
    [parseError]
  );

  /**
   * Clear error history
   */
  const clearErrors = useCallback((): void => {
    setErrorHistory([]);
  }, []);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((error: ErrorInput): string => {
    if (error instanceof APIError) {
      switch (true) {
        case isNetworkError(error):
          return "Network connection error. Please check your internet connection and try again.";
        case isTimeoutError(error):
          return "Request timed out. The server is taking too long to respond. Please try again.";
        case isNotFoundError(error):
          return "The requested competency could not be found. Please check the code and try again.";
        case error.status === 500:
          return "Server error. Please try again later or contact support if the problem persists.";
        case error.status && error.status >= 400 && error.status < 500:
          return "Invalid request. Please check your input and try again.";
        default:
          return error.message || "An unexpected error occurred. Please try again.";
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "An unknown error occurred. Please try again.";
  }, []);

  /**
   * Get error recommendations for users
   */
  const getErrorRecommendations = useCallback((error: ErrorInput): string[] => {
    const recommendations: string[] = [];

    if (error instanceof APIError) {
      if (isNetworkError(error)) {
        recommendations.push("Check your internet connection");
        recommendations.push("Try refreshing the page");
        recommendations.push("Contact your network administrator if the problem persists");
      } else if (isTimeoutError(error)) {
        recommendations.push("Try again in a few moments");
        recommendations.push("Check if the server is experiencing high load");
        recommendations.push("Try using a different network connection");
      } else if (isNotFoundError(error)) {
        recommendations.push("Verify the competency code is correct");
        recommendations.push("Check if the competency exists in the system");
        recommendations.push("Try searching for similar codes");
      } else if (error.status && error.status >= 500) {
        recommendations.push("Try again later");
        recommendations.push("Contact support if the problem persists");
        recommendations.push("Check system status page if available");
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("Try refreshing the page");
      recommendations.push("Clear your browser cache");
      recommendations.push("Contact support if the problem continues");
    }

    return recommendations;
  }, []);

  /**
   * Validate SFIA code format
   */
  const validateSfiaCode = useCallback((code: string): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!/^[A-Z]{2,6}$/i.test(code)) {
      warnings.push("SFIA codes are typically 2-6 uppercase letters (e.g., PROG, DBAD, ARCH)");
    }

    if (code.length > 6) {
      errors.push("SFIA code should not exceed 6 characters");
    }

    if (code.length < 2) {
      errors.push("SFIA code should be at least 2 characters");
    }

    if (!/^[A-Za-z]+$/.test(code)) {
      errors.push("SFIA code should only contain letters");
    }

    return { errors, warnings };
  }, []);

  /**
   * Validate TPQI code format
   */
  const validateTpqiCode = useCallback((code: string): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!/^[A-Z0-9-]{3,20}$/i.test(code)) {
      warnings.push("TPQI codes typically contain letters, numbers, and hyphens (e.g., ICT-LIGW-404B)");
    }

    if (code.length > 20) {
      errors.push("TPQI code should not exceed 20 characters");
    }

    if (code.length < 3) {
      errors.push("TPQI code should be at least 3 characters");
    }

    if (!/^[A-Za-z0-9-]+$/.test(code)) {
      errors.push("TPQI code should only contain letters, numbers, and hyphens");
    }

    return { errors, warnings };
  }, []);

  /**
   * Validate competency code format
   */
  const validateCompetencyCode = useCallback(
    (code: string, source: CompetencySource): ValidationResult => {
      // Basic validation
      if (!code || typeof code !== "string") {
        return { isValid: false, errors: ["Competency code is required"], warnings: [] };
      }

      const trimmedCode = code.trim();

      if (trimmedCode.length === 0) {
        return { isValid: false, errors: ["Competency code cannot be empty"], warnings: [] };
      }

      // Source-specific validation
      const result = source === "sfia" ? validateSfiaCode(trimmedCode) : validateTpqiCode(trimmedCode);

      return {
        isValid: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings,
      };
    },
    [validateSfiaCode, validateTpqiCode]
  );

  /**
   * Get error statistics
   */
  const errorStats = useMemo(() => {
    const stats = {
      total: errorHistory.length,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      retryable: 0,
      recent: errorHistory.slice(0, 5),
    };

    errorHistory.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      if (error.source) {
        stats.bySource[error.source] = (stats.bySource[error.source] || 0) + 1;
      }
      if (error.retryable) {
        stats.retryable++;
      }
    });

    return stats;
  }, [errorHistory]);

  /**
   * Check if there are recent errors of a specific type
   */
  const hasRecentErrorType = useCallback(
    (type: ErrorInfo["type"], minutes: number = 5): boolean => {
      const cutoff = new Date(Date.now() - minutes * 60 * 1000);
      return errorHistory.some((error) => error.type === type && error.timestamp > cutoff);
    },
    [errorHistory]
  );

  return {
    // State
    errorHistory,
    errorStats,

    // Actions
    addError,
    clearErrors,
    parseError,

    // Utilities
    getErrorMessage,
    getErrorRecommendations,
    validateCompetencyCode,
    hasRecentErrorType,

    // Computed values
    hasErrors: errorHistory.length > 0,
    latestError: errorHistory[0] || null,
    retryableErrorsCount: errorStats.retryable,
  };
}

export default useCompetencyDetailError;
