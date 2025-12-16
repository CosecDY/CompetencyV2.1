import { useEffect, useState } from "react";
import type { CompetencyResponse } from "../types/CompetencyTypes";
import { fetchCompetenciesBySearchTerm } from "../services/searchCompetencyAPI";

/**
 * @constant DEBOUNCE_DELAY
 * @description Defines the debounce delay in milliseconds for search
 * Optimized for smooth user experience - shows typing indicator immediately,
 * then searches after user stops typing for this duration
 */
const DEBOUNCE_DELAY = 500; // Increased for better UX

/**
 * @type {ItemType}
 * @description Item type for lazy loading results
 */
export type ItemType = {
  id: string;
  name: string;
  framework: string;
};

/**
 * @function getStructuredErrorMessage
 * @description Handles new structured server error responses
 */
const getStructuredErrorMessage = (
  errorType: string,
  message: string
): string => {
  switch (errorType) {
    case "validation":
      if (message?.includes("Search term must be at least")) {
        return "คำค้นหาต้องมีอย่างน้อย 2 ตัวอักษร";
      }
      if (message?.includes("too long")) {
        return "คำค้นหายาวเกินไป (สูงสุด 100 ตัวอักษร)";
      }
      if (message?.includes("searchTerm")) {
        return "กรุณาใส่คำค้นหาที่ถูกต้อง";
      }
      return "ข้อมูลที่ป้อนไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง";

    case "database_connection":
      return "ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้งในภายหลัง";

    case "database_query":
      return "เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง";

    case "timeout":
      return "การค้นหาใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";

    default:
      return "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง";
  }
};

/**
 * @function getHTTPErrorMessage
 * @description Handles HTTP status code errors
 */
const getHTTPErrorMessage = (
  status: number,
  responseData?: Record<string, unknown>
): string => {
  switch (status) {
    case 400: {
      const serverMessage = responseData?.message;
      if (typeof serverMessage === "string") {
        if (serverMessage.includes("Search term must be at least")) {
          return "คำค้นหาต้องมีอย่างน้อย 2 ตัวอักษร";
        }
        if (serverMessage.includes("too long")) {
          return "คำค้นหายาวเกินไป กรุณาใช้คำค้นหาที่สั้นกว่า";
        }
      }
      return "คำค้นหาไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง";
    }
    case 401:
      return "ไม่ได้รับอนุญาตให้เข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่";
    case 403:
      return "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้";
    case 404:
      return "ไม่พบข้อมูลที่ต้องการ";
    case 408:
    case 504:
      return "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
    case 429:
      return "ค้นหาบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
    case 500:
      return "เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง";
    case 502:
    case 503:
      return "เซิร์ฟเวอร์ไม่สามารถให้บริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง";
    default:
      return `เกิดข้อผิดพลาดในการดึงข้อมูล (รหัสข้อผิดพลาด: ${status})`;
  }
};

// Helper functions for error handling
const handleAPIError = (error: {
  errorType?: string;
  message: string;
  status?: number;
}): string => {
  if (error.errorType) {
    return getStructuredErrorMessage(error.errorType, error.message);
  }
  if (error.status) {
    return getHTTPErrorMessage(error.status, { message: error.message });
  }
  return error.message;
};

const handleResponseError = (
  response: Record<string, unknown>
): string | null => {
  if (response.data && typeof response.data === "object") {
    const data = response.data as Record<string, unknown>;
    if (
      data.errorType &&
      typeof data.errorType === "string" &&
      data.message &&
      typeof data.message === "string"
    ) {
      return getStructuredErrorMessage(data.errorType, data.message);
    }
  }

  if (typeof response.status === "number") {
    return getHTTPErrorMessage(
      response.status,
      response.data as Record<string, unknown>
    );
  }

  return null;
};

const handleCommonErrors = (error: Record<string, unknown>): string | null => {
  // Handle legacy fetch-related TypeError
  if (
    error instanceof TypeError &&
    typeof error.message === "string" &&
    error.message.includes("fetch")
  ) {
    return "ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง";
  }

  // Handle generic network errors
  if (error.name === "NetworkError" || error.code === "NETWORK_ERROR") {
    return "เกิดปัญหาเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง";
  }

  // Handle timeout and abort errors
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
  }

  const message =
    typeof error.message === "string" ? error.message.toLowerCase() : "";

  // Check for network-related messages
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return "ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง";
  }

  // Check for timeout messages
  if (message.includes("timeout")) {
    return "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
  }

  // Check for empty search term
  if (message.includes("empty") || message.includes("searchterm")) {
    return "กรุณาใส่คำค้นหา";
  }

  return null;
};

/**
 * @function getErrorMessage
 * @description A robust error message translator for lazy loading
 */
const getErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== "object") {
    return "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";
  }

  const error = err as Record<string, unknown>;

  // Handle APIError from our API service
  if (error.name === "APIError" && "errorType" in error && "message" in error) {
    return handleAPIError(
      error as { errorType?: string; message: string; status?: number }
    );
  }

  // Handle new structured server error responses (legacy format)
  if (error.response && typeof error.response === "object") {
    const responseResult = handleResponseError(
      error.response as Record<string, unknown>
    );
    if (responseResult) return responseResult;
  }

  // Handle common error types
  const commonResult = handleCommonErrors(error);
  if (commonResult) return commonResult;

  // Fallback for errors that have a message property
  if (typeof error.message === "string" && error.message) {
    return `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`;
  }

  // The ultimate fallback for any unexpected error type.
  return "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";
};

/**
 * @function useLazyCompetencyResults
 * @description A custom hook for lazy loading competency search results without pagination
 * Returns all items for use with lazy loading components
 */
export function useLazyCompetencyResults() {
  // --- STATE MANAGEMENT ---
  const [results, setResults] = useState<CompetencyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("query") ?? "";
  });
  const [query, setQuery] = useState(searchTerm);

  const safeSearchTerm = typeof searchTerm === "string" ? searchTerm : "";

  // --- DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    // If the search term is empty, reset state
    if (!safeSearchTerm.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      setQuery("");
      return;
    }

    // Show immediate feedback for typing
    setError(null);

    // Set up debounced execution
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchCompetenciesBySearchTerm(safeSearchTerm.trim());
        setResults(Array.isArray(data) ? data : []);
        setQuery(safeSearchTerm.trim());
      } catch (err) {
        console.error("Error fetching Competency data:", err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [safeSearchTerm]);

  // --- URL SYNCHRONIZATION ---
  useEffect(() => {
    const url = new URL(window.location.href);
    const trimmedTerm = safeSearchTerm.trim();

    if (trimmedTerm) {
      url.searchParams.set("query", trimmedTerm);
    } else {
      url.searchParams.delete("query");
    }
    window.history.replaceState({}, "", url.toString());
  }, [safeSearchTerm]);

  // --- DATA TRANSFORMATION ---
  // Transform results to get ALL items (no pagination)
  const allItems: ItemType[] = (results ?? []).flatMap(
    (group) =>
      group?.Competencies?.map((CompetencyItem) => ({
        id: CompetencyItem.id,
        name: CompetencyItem.name,
        framework: group.source,
      })) ?? []
  );

  // --- ACTION HANDLERS ---
  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      handleClearSearch();
      return;
    }
    setSearchTerm(trimmed);
    setQuery(trimmed);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setQuery("");
    setResults([]);
    setError(null);
  };

  const handleViewDetails = (itemId: string) => {
    console.log(`View details for item ID: ${itemId}`);
  };

  const isEmptySearch = !safeSearchTerm.trim() && !loading;

  // --- RETURNED API ---
  return {
    query,
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    allItems,
    isEmptySearch,
    handleSearch,
    handleClearSearch,
    handleViewDetails,
  };
}
