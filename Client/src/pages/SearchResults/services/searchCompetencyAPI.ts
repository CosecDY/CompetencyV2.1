import type { CompetencyResponse } from "../types/CompetencyTypes";
import api from "@Services/api";

// Enhanced error class for better error handling
export class APIError extends Error {
  constructor(message: string, public status?: number, public response?: Response, public source?: string, public errorType?: string, public details?: unknown) {
    super(message);
    this.name = "APIError";
  }
}

// Interface for competency item
interface CompetencyItem {
  name: string;
  id: string;
}

// Helper function to parse error response
async function parseErrorResponse(res: Response): Promise<{
  errorMessage: string;
  errorType: string;
  details: unknown;
}> {
  let errorData: Record<string, unknown> | null = null;
  try {
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorData = await res.json();
    }
  } catch (parseError) {
    console.warn("Failed to parse error response as JSON:", parseError);
  }

  return {
    errorMessage: (errorData?.message as string) || `HTTP ${res.status}: ${res.statusText}`,
    errorType: (errorData?.errorType as string) || "unknown",
    details: errorData?.details || null,
  };
}

// Enhanced fetch function with better error handling
export async function fetchFromSource(dbType: "sfia" | "tpqi", searchTerm: string): Promise<CompetencyResponse> {
  try {
    const res = await api.post(`/competency/search/${dbType}`, { searchTerm });

    const data = res.data;

    // Server returns { results: array } for POST requests
    const Competencies: Array<{ name: string; id: string }> = Array.isArray(data.results)
      ? data.results.map((item: CompetencyItem) => ({
          name: item.name,
          id: item.id,
        }))
      : [];

    return { source: dbType, Competencies };
  } catch (error: any) {
    if (error.response) {
      const { errorMessage, errorType, details } = await parseErrorResponse(error.response);
      throw new APIError(errorMessage, error.response.status, error.response, dbType, errorType, details);
    }

    if (error.code === "ECONNABORTED") {
      throw new APIError(`Request timeout for ${dbType}`, 0, undefined, dbType, "timeout");
    }

    if (error.message?.includes("Network Error")) {
      throw new APIError(`Network error when fetching from ${dbType}`, 0, undefined, dbType, "network");
    }

    throw new APIError(`Failed to fetch from ${dbType}: ${error.message || "Unknown error"}`, 0, undefined, dbType, "unknown");
  }
}

export async function fetchCompetenciesBySearchTerm(searchTerm: string): Promise<CompetencyResponse[]> {
  if (!searchTerm.trim()) {
    throw new APIError("Search term cannot be empty");
  }

  const dbTypes: ("sfia" | "tpqi")[] = ["sfia", "tpqi"];
  const results: CompetencyResponse[] = [];
  const errors: APIError[] = [];

  const promises = dbTypes.map(async (dbType) => {
    try {
      const result = await fetchFromSource(dbType, searchTerm);
      return { success: true, data: result, error: null };
    } catch (error) {
      // FIX: Ensure console.error is called with the correct parameters
      console.error(`[${dbType}]`, error);
      return {
        success: false,
        data: { source: dbType, Competencies: [] },
        error: error instanceof APIError ? error : new APIError(`Unknown error from ${dbType}`),
      };
    }
  });

  const responses = await Promise.all(promises);

  // Process responses
  responses.forEach((response) => {
    if (response.success) {
      results.push(response.data);
    } else {
      results.push(response.data);
      if (response.error) {
        errors.push(response.error);
      }
    }
  });

  // If all sources failed, throw the first error to trigger error handling in UI
  if (errors.length === dbTypes.length) {
    console.error(
      `All sources failed:`,
      errors.map((e) => e.message)
    );
    // Throw the first error to trigger the error state in the UI
    throw errors[0];
  }

  // If some sources failed but we have results, log warnings but continue
  if (errors.length > 0) {
    console.warn(
      `Some sources failed:`,
      errors.map((e) => e.message)
    );
  }

  return results;
}

// Alternative version that throws on any error (stricter)
export async function fetchCompetenciesBySearchTermStrict(searchTerm: string): Promise<CompetencyResponse[]> {
  if (!searchTerm.trim()) {
    throw new APIError("Search term cannot be empty");
  }

  const dbTypes: ("sfia" | "tpqi")[] = ["sfia", "tpqi"];
  const promises = dbTypes.map((dbType) => fetchFromSource(dbType, searchTerm));
  return await Promise.all(promises);
}

// Function to get all competencies from a specific database
export async function getAllCompetencies(dbType: "sfia" | "tpqi"): Promise<CompetencyResponse> {
  try {
    const res = await api.get(`/competency/search/${dbType}`);

    const data = res.data;

    // Server returns { Competencies: array } for GET requests
    const Competencies: Array<{ name: string; id: string }> = Array.isArray(data.Competencies)
      ? data.Competencies.map((item: CompetencyItem) => ({
          name: item.name,
          id: item.id,
        }))
      : [];

    return { source: dbType, Competencies };
  } catch (error: any) {
    if (error.response) {
      const { errorMessage, errorType, details } = await parseErrorResponse(error.response);
      throw new APIError(errorMessage, error.response.status, error.response, dbType, errorType, details);
    }

    if (error.code === "ECONNABORTED") {
      throw new APIError(`Request timeout for ${dbType}`, 0, undefined, dbType, "timeout");
    }

    if (error.message?.includes("Network Error")) {
      throw new APIError(`Network error when fetching from ${dbType}`, 0, undefined, dbType, "network");
    }

    throw new APIError(`Failed to fetch from ${dbType}: ${error.message || "Unknown error"}`, 0, undefined, dbType, "unknown");
  }
}

// Function to get all competencies from all databases
export async function getAllCompetenciesFromAllSources(): Promise<CompetencyResponse[]> {
  const dbTypes: ("sfia" | "tpqi")[] = ["sfia", "tpqi"];
  const results: CompetencyResponse[] = [];
  const errors: APIError[] = [];

  const promises = dbTypes.map(async (dbType) => {
    try {
      const result = await getAllCompetencies(dbType);
      return { success: true, data: result, error: null };
    } catch (error) {
      console.error(`[${dbType}]`, error);
      return {
        success: false,
        data: { source: dbType, Competencies: [] },
        error: error instanceof APIError ? error : new APIError(`Unknown error from ${dbType}`),
      };
    }
  });

  const responses = await Promise.all(promises);

  // Process responses
  responses.forEach((response) => {
    if (response.success) {
      results.push(response.data);
    } else {
      results.push(response.data);
      if (response.error) {
        errors.push(response.error);
      }
    }
  });

  // If all sources failed, throw the first error
  if (errors.length === dbTypes.length) {
    throw errors[0];
  }

  // If some sources failed but we have results, log warnings but continue
  if (errors.length > 0) {
    console.warn(
      `Some sources failed:`,
      errors.map((e) => e.message)
    );
  }

  return results;
}

// Utility function to check if error is network-related
export function isNetworkError(error: unknown): boolean {
  // Add a guard clause to handle null/undefined inputs
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as Record<string, unknown>;
  return (
    (error instanceof TypeError && error.message.includes("fetch")) ||
    err.name === "NetworkError" ||
    err.code === "NETWORK_ERROR" ||
    !!(err.message as string)?.toLowerCase().includes("network") ||
    !!(err.message as string)?.toLowerCase().includes("connection")
  );
}

// Utility function to check if error is timeout-related
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as Record<string, unknown>;
  const message = (err.message as string)?.toLowerCase() || "";

  return err.name === "AbortError" || err.name === "TimeoutError" || message.includes("timed out") || (message.includes("timeout") && !message.includes("not a timeout"));
}

// Test functions for error handling (remove in production)
export async function testNetworkError(): Promise<CompetencyResponse[]> {
  throw new APIError("Network error", 0, undefined, "test");
}

export async function testValidationError(): Promise<CompetencyResponse[]> {
  throw new APIError("Search term must be at least 2 characters long", 400, undefined, "test");
}

export async function testServerError(): Promise<CompetencyResponse[]> {
  throw new APIError("Internal server error", 500, undefined, "test");
}

export async function testTimeoutError(): Promise<CompetencyResponse[]> {
  throw new APIError("Request timeout", 408, undefined, "test");
}

// Enhanced error simulation for different scenarios
export async function testErrorByType(errorType: "network" | "validation" | "server" | "timeout" | "structured"): Promise<CompetencyResponse[]> {
  switch (errorType) {
    case "network": {
      throw new TypeError("fetch is not defined");
    }
    case "validation": {
      const validationError = new Error("Bad Request") as Error & { response?: { status: number; data: Record<string, unknown> } };
      validationError.response = {
        status: 400,
        data: {
          errorType: "validation",
          message: "Search term must be at least 2 characters long",
          details: { minLength: 2, provided: 1 },
        },
      };
      throw validationError;
    }
    case "server": {
      const serverError = new Error("Internal Server Error") as Error & { response?: { status: number; data: Record<string, unknown> } };
      serverError.response = {
        status: 500,
        data: {
          errorType: "database_connection",
          message: "Database connection failed",
        },
      };
      throw serverError;
    }
    case "timeout": {
      const timeoutError = new Error("Timeout") as Error & { name: string };
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    case "structured": {
      const structuredError = new Error("Structured Error") as Error & { response?: { status: number; data: Record<string, unknown> } };
      structuredError.response = {
        status: 503,
        data: {
          errorType: "database_connection",
          message: "Database connection failed",
          details: { code: "ECONNREFUSED" },
        },
      };
      throw structuredError;
    }
    default:
      throw new APIError("Unknown error type", 500, undefined, "test");
  }
}
