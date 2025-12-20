import { prismaSfia } from "@/db/prismaClients";

/**
 * Result of evidence deletion operation.
 *
 * @interface DeleteEvidenceResult
 * @property {number} id - The ID of the deleted evidence.
 * @property {string|null} text - The text content of the evidence.
 * @property {number|null} subSkillId - The sub-skill ID associated with the evidence.
 * @property {string} userId - The user ID who owned the evidence.
 * @property {string|null} evidenceUrl - The URL of the deleted evidence.
 * @property {Date} createdAt - When the evidence was originally created.
 * @property {string} approvalStatus - The approval status of the evidence.
 */
export interface DeleteEvidenceResult {
  id: number;
  text: string | null;
  subSkillId: number | null;
  userId: string; // [UPDATED] Replaced dataCollectionId with userId
  evidenceUrl: string | null;
  createdAt: Date;
  approvalStatus: string;
}

/**
 * Deletes evidence by its unique identifier.
 *
 * This function performs a secure deletion of evidence data by:
 * - Validating the evidence ID parameter
 * - Removing the evidence record from the database
 * - Returning the deleted evidence information for confirmation
 *
 * @async
 * @function deleteEvidenceById
 * @param {string} id - The unique identifier of the evidence to delete.
 * @returns {Promise<DeleteEvidenceResult>} The deleted evidence data for confirmation.
 *
 * @throws {Error} If the evidence ID is invalid, evidence not found, or database operation fails.
 */
export async function deleteEvidenceById(id: string): Promise<DeleteEvidenceResult> {
  try {
    // Validate input parameter
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Evidence ID is required and must be a non-empty string");
    }

    // Convert to number and validate
    const numericId = parseInt(id.trim());
    if (isNaN(numericId)) {
      throw new Error("Evidence ID must be a valid number");
    }

    // Attempt to delete the evidence
    const result = await prismaSfia.information.delete({
      where: { id: numericId },
    });

    return {
      id: result.id,
      text: result.text,
      subSkillId: result.subSkillId,
      userId: result.userId, // [UPDATED] Return userId directly
      evidenceUrl: result.evidenceUrl,
      createdAt: result.createdAt,
      approvalStatus: result.approvalStatus,
    };
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error.code === "P2025") {
      throw new Error(`Evidence with ID '${id}' not found or already deleted`);
    }

    // Handle other database errors
    if (error.code?.startsWith("P")) {
      throw new Error(`Database error while deleting evidence: ${error.message}`);
    }

    // Handle validation errors
    if (error.message?.includes("required")) {
      throw error;
    }

    // Handle unexpected errors
    console.error("Unexpected error in deleteEvidenceById:", error);
    throw new Error(`Failed to delete evidence with ID '${id}': ${error.message}`);
  }
}

/**
 * Deletes evidence by subskill ID and user ID.
 *
 * This function provides deletion by specific subskill:
 * - Finding evidence associated with a specific subskill ID and user
 * - Deleting the most recent evidence for that combination
 * - Returning the deleted evidence information
 *
 * @async
 * @function deleteEvidenceBySubSkillAndUser
 * @param {number} subSkillId - The subskill ID associated with the evidence.
 * @param {string} userId - The user ID who owns the evidence.
 * @returns {Promise<DeleteEvidenceResult|null>} The deleted evidence data, or null if no evidence found.
 *
 * @throws {Error} If parameters are invalid or database operation fails.
 */
export async function deleteEvidenceBySubSkillAndUser(subSkillId: number, userId: string): Promise<DeleteEvidenceResult | null> {
  try {
    // Validate input parameters
    if (!subSkillId || !userId) {
      throw new Error("SubSkill ID and user ID are required parameters");
    }

    // Validate subSkillId is a positive number
    if (typeof subSkillId !== "number" || subSkillId <= 0) {
      throw new Error("SubSkill ID must be a positive number");
    }

    // Find the evidence to delete
    // [UPDATED] Changed query to check userId directly on Information table
    const evidenceToDelete = await prismaSfia.information.findFirst({
      where: {
        subSkillId: subSkillId,
        userId: userId.trim(), // Direct check
      },
      orderBy: {
        createdAt: "desc", // Get the most recent evidence
      },
    });

    // If no evidence found, return null
    if (!evidenceToDelete) {
      return null;
    }

    // Delete the found evidence
    const result = await prismaSfia.information.delete({
      where: { id: evidenceToDelete.id },
    });

    return {
      id: result.id,
      text: result.text,
      subSkillId: result.subSkillId,
      userId: result.userId, // [UPDATED] Return userId directly
      evidenceUrl: result.evidenceUrl,
      createdAt: result.createdAt,
      approvalStatus: result.approvalStatus,
    };
  } catch (error: any) {
    console.error("Error deleting evidence by subskill and user:", error);
    throw new Error(`Failed to delete evidence for subskill: ${subSkillId} and user: ${userId}`);
  }
}

/**
 * Deletes evidence by its unique identifier (legacy support).
 *
 * @deprecated Use deleteEvidenceById instead.
 * This function maintains backward compatibility but should be replaced in new code.
 */
export async function delEvidenceServices(id: string): Promise<DeleteEvidenceResult> {
  return deleteEvidenceById(id);
}
