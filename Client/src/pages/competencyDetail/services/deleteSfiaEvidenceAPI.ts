import { AxiosResponse } from "axios";
import api from "@Services/api";

// Types for the delete evidence request and response
export interface DeleteEvidenceRequest {
  subSkillId: number;
}

export interface DeleteEvidenceResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    text: string | null;
    subSkillId: number | null;
    dataCollectionId: number | null;
    evidenceUrl: string | null;
    createdAt: string;
    approvalStatus: string;
  };
}

export class DeleteSfiaEvidenceService {
  0;
  async deleteEvidence(request: DeleteEvidenceRequest): Promise<DeleteEvidenceResponse> {
    this.validateRequest(request);

    try {
      const response: AxiosResponse<DeleteEvidenceResponse> = await api.delete(`/sfia/evidence/delete`, {
        data: {
          subSkillId: request.subSkillId,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("Unauthorized: Please log in again");
        }
        if (error.response.status === 404) {
          throw new Error("Evidence not found or already deleted");
        }

        if (error.response.status === 403) {
          throw new Error("Forbidden: You don't have permission to delete this evidence");
        }
        throw new Error(`Failed to delete evidence: ${error.response.data?.message || error.message}`);
      }

      throw new Error("Network error: Unable to connect to the server");
    }
  }

  private validateRequest(request: DeleteEvidenceRequest): boolean {
    if (!request.subSkillId || typeof request.subSkillId !== "number" || request.subSkillId <= 0) {
      throw new Error("SubSkill ID is required and must be a positive number");
    }
    return true;
  }
}

export const createDeleteSfiaEvidenceService = (): DeleteSfiaEvidenceService => {
  return new DeleteSfiaEvidenceService();
};
