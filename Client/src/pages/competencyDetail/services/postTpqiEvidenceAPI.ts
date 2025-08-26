import { SubmitTpqiEvidenceRequest, TpqiApiResponse as ApiResponse } from "../types/tpqi";
import api from "@Services/api";
import { AxiosError } from "axios";
/**
 * Service class for managing TPQI evidence submissions.
 * Handles API requests and basic client-side validations.
 */
export class TpqiEvidenceService {
  /**
   * Submits evidence data to the backend API.
   *
   * @param request - The evidence data conforming to SubmitTpqiEvidenceRequest.
   * @returns A promise resolving to ApiResponse indicating the result.
   * @throws Error if the API request fails.
   */
  async submitEvidence(request: SubmitTpqiEvidenceRequest): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>("/tpqi/evidence", request);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const message = axiosError.response?.data?.message || axiosError.message || "Failed to submit evidence";

      throw new Error(message);
    }
  }

  /**
   * Validates whether the given evidence URL or description is provided.
   *
   * @param url - The evidence URL or description.
   * @returns An object indicating validity and an optional error message.
   */
  validateEvidenceUrl(url: string): { isValid: boolean; error?: string } {
    if (!url || url.trim() === "") {
      return {
        isValid: false,
        error: "Please enter evidence URL or description.",
      };
    }
    return { isValid: true };
  }

  /**
   * Checks if the provided URL is a valid HTTP or HTTPS URL.
   *
   * @param url - The URL to validate.
   * @returns True if the URL starts with 'http://' or 'https://', otherwise false.
   */
  isValidUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
  }
}
