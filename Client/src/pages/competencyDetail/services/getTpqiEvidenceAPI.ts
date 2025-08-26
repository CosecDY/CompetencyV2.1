import api from "@Services/api";

export interface TpqiEvidenceData {
  skills?: { [skillId: number]: { evidenceUrl: string; approvalStatus: string | null } };
  knowledge?: { [knowledgeId: number]: { evidenceUrl: string; approvalStatus: string | null } };
}

export interface TpqiEvidenceApiResponse {
  success: boolean;
  message: string;
  data?: TpqiEvidenceData;
}

/**
 * Service class for fetching TPQI evidence data
 * Follows the same pattern as SfiaEvidenceService
 */
export class TpqiEvidenceService {
  /**
   * Fetches existing evidence for a TPQI unit
   */
  async getEvidence(unitCode: string): Promise<TpqiEvidenceApiResponse> {
    try {
      const response = await api.get(`/tpqi/evidence/${unitCode}`);

      return {
        success: true,
        message: response.data.message || "Evidence fetched successfully",
        data: response.data.data,
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string }; statusText?: string } };
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.statusText;
        throw new Error(errorMessage || "Failed to fetch evidence");
      }
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      throw new Error(errorMessage);
    }
  }
}

export const tpqiEvidenceService = new TpqiEvidenceService();
