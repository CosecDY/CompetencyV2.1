import api from "@Services/api";
import { AxiosError } from "axios";
import { ApiResponse } from "../types/sfia";

/**
 * Request interface for getting SFIA evidence.
 */
export interface GetEvidenceRequest {
  skillCode: string;
}

/**
 * Response interface for SFIA evidence retrieval.
 */
// Server returns a SkillEvidenceCollection shape
export interface EvidenceInfo {
  id: number;
  evidenceUrl: string | null;
  approvalStatus?: string | null;
}

export interface EvidenceData {
  skillCode: string;
  userId: string;
  evidences: EvidenceInfo[];
  totalEvidences: number;
}

/**
 * Extended API response for SFIA evidence retrieval.
 */
export interface GetEvidenceResponse extends ApiResponse {
  data?: EvidenceData;
}

/**
 * Service class for retrieving SFIA evidence.
 */
export class GetSfiaEvidenceService {
  async getEvidence(request: GetEvidenceRequest): Promise<GetEvidenceResponse> {
    try {
      const response = await api.post<GetEvidenceResponse>("/sfia/evidence/get", request);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<GetEvidenceResponse>;
      const errData = axiosError.response?.data;
      throw new Error((errData && "message" in errData ? errData.message : undefined) || axiosError.message || "Failed to retrieve evidence");
    }
  }

  validateGetEvidenceRequest(
    skillCode: string,
    userId: string
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (!skillCode || skillCode.trim() === "") {
      return {
        isValid: false,
        error: "Skill code is required",
      };
    }

    if (!userId || userId.trim() === "") {
      return {
        isValid: false,
        error: "User ID is required",
      };
    }

    return { isValid: true };
  }

  hasEvidenceData(response: GetEvidenceResponse): boolean {
    return response.success && !!response.data;
  }
}
