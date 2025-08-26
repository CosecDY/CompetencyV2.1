import api from "@Services/api";
import axios from "axios";

// Types for the delete evidence request and response
export interface DeleteKnowledgeEvidenceRequest {
  knowledgeId: number;
}

export interface DeleteSkillEvidenceRequest {
  skillId: number;
}

export interface DeleteTpqiEvidenceRequest {
  evidenceType: "knowledge" | "skill";
  evidenceId: number;
}

export interface DeleteTpqiEvidenceResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    userId: string;
    knowledgeId?: number;
    skillId?: number;
    evidenceUrl: string | null;
    approvalStatus: string;
  };
}

/**

 */
export class DeleteTpqiEvidenceService {
  /**
   * Deletes knowledge evidence for a specific knowledge ID.
   */
  async deleteKnowledgeEvidence(request: DeleteKnowledgeEvidenceRequest): Promise<DeleteTpqiEvidenceResponse> {
    this.validateKnowledgeRequest(request);
    try {
      const response = await api.delete<DeleteTpqiEvidenceResponse>(`/tpqi/evidence/knowledge/delete`, { data: request });

      return response.data;
    } catch (error) {
      this.handleError(error, "knowledge evidence");
    }
  }

  /**
   * Deletes skill evidence for a specific skill ID.
   */
  async deleteSkillEvidence(request: DeleteSkillEvidenceRequest): Promise<DeleteTpqiEvidenceResponse> {
    this.validateSkillRequest(request);
    try {
      const response = await api.delete<DeleteTpqiEvidenceResponse>(`/tpqi/evidence/skill/delete`, { data: request });

      return response.data;
    } catch (error) {
      this.handleError(error, "skill evidence");
    }
  }

  /**

   * Unified method to delete evidence by type (knowledge or skill).
   */
  async deleteEvidence(request: DeleteTpqiEvidenceRequest): Promise<DeleteTpqiEvidenceResponse> {
    this.validateTpqiRequest(request);
    try {
      const response = await api.delete<DeleteTpqiEvidenceResponse>(`/tpqi/evidence/delete`, { data: request });

      return response.data;
    } catch (error) {
      this.handleError(error, "evidence");
    }
  }

  // ---- Validation ----
  private validateKnowledgeRequest(request: DeleteKnowledgeEvidenceRequest) {
    if (!request.knowledgeId || typeof request.knowledgeId !== "number") {
      throw new Error("knowledgeId is required and must be a number");
    }
    if (request.knowledgeId <= 0) {
      throw new Error("knowledgeId must be a positive number");
    }
  }

  private validateSkillRequest(request: DeleteSkillEvidenceRequest) {
    if (!request.skillId || typeof request.skillId !== "number") {
      throw new Error("skillId is required and must be a number");
    }
    if (request.skillId <= 0) {
      throw new Error("skillId must be a positive number");
    }
  }

  private validateTpqiRequest(request: DeleteTpqiEvidenceRequest) {
    if (!["knowledge", "skill"].includes(request.evidenceType)) {
      throw new Error("evidenceType must be 'knowledge' or 'skill'");
    }
    if (!request.evidenceId || typeof request.evidenceId !== "number") {
      throw new Error("evidenceId is required and must be a number");
    }
    if (request.evidenceId <= 0) {
      throw new Error("evidenceId must be a positive number");
    }
  }

  // ---- Error handler ----
  private handleError(error: unknown, evidenceType: string): never {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) throw new Error("Unauthorized: Please log in again");
      if (error.response?.status === 404) throw new Error(`${evidenceType} not found or already deleted`);
      if (error.response?.status === 403) throw new Error(`Forbidden: You don't have permission to delete this ${evidenceType}`);
      if (error.response?.status === 409) throw new Error(`Cannot delete ${evidenceType} due to existing references`);

      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to delete ${evidenceType}: ${errorMessage}`);
    }
    throw new Error(`Failed to delete ${evidenceType}: Network error`);
  }
}

/**
 * Factory function to create a DeleteTpqiEvidenceService instance.
 */

export const createDeleteTpqiEvidenceService = (): DeleteTpqiEvidenceService => new DeleteTpqiEvidenceService();
