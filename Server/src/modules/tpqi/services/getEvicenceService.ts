import { prismaTpqi } from "@/db/prismaClients";
import { UserKnowledge_approvalStatus } from "@prisma/client_tpqi";

/**
 * Evidence information from skill or knowledge with associated URL.
 *
 * @interface EvidenceInfo
 * @property {number} id - Unique identifier of the skill or knowledge.
 * @property {string|null} evidenceUrl - URL associated with the evidence.
 * @property {ApprovalStatus} approvalStatus - Approval status of the evidence.
 * @property {string} type - Type of evidence: 'skill' or 'knowledge'.
 */
export interface EvidenceInfo {
  id: number;
  evidenceUrl: string | null;
  approvalStatus: UserKnowledge_approvalStatus;
  type: "skill" | "knowledge";
}

/**
 * Complete evidence collection for a unit code with statistical summary.
 *
 * @interface UnitCodeEvidenceCollection
 * @property {string} unitCode - The unit code that was queried.
 * @property {string} userId - The user ID for which evidence was retrieved.
 * @property {EvidenceInfo[]} evidences - Array of evidence information from skills and knowledge.
 * @property {EvidenceInfo[]} skillEvidences - Array of skill evidence only.
 * @property {EvidenceInfo[]} knowledgeEvidences - Array of knowledge evidence only.
 * @property {number} totalEvidences - Total count of evidence items found.
 */
export interface UnitCodeEvidenceCollection {
  unitCode: string;
  userId: string;
  evidences: EvidenceInfo[];
  skillEvidences: EvidenceInfo[];
  knowledgeEvidences: EvidenceInfo[];
  totalEvidences: number;
}

/**
 * Retrieves evidence collection for a specific unit code and user.
 *
 * This function performs a complex database query to fetch evidence data including:
 * - All skills and knowledge associated with the specified unit code
 * - Evidence URLs from user's skill and knowledge evidence
 * - Only the most recent evidence per skill/knowledge
 * - Complete statistical summary
 *
 * @async
 * @function getEvidenceByUnitCodeAndUser
 * @param {string} unitCode - The unique unit code to search for (e.g., 'ILS-ZAYZ-391B').
 * @param {string} userId - The unique user identifier to filter evidence by.
 * @returns {Promise<UnitCodeEvidenceCollection|null>} Complete evidence collection with statistics, or null if unit code not found.
 *
 * @throws {Error} If database query fails or parameters are invalid.
 *
 * @example
 * // Retrieve evidence for unit code for a specific user
 * const evidenceData = await getEvidenceByUnitCodeAndUser('ILS-ZAYZ-391B', 'user-123');
 * if (evidenceData) {
 *   console.log(`Found ${evidenceData.totalEvidences} evidence items`);
 *   console.log(`Skills: ${evidenceData.skillEvidences.length}, Knowledge: ${evidenceData.knowledgeEvidences.length}`);
 *   evidenceData.evidences.forEach(evidence => {
 *     console.log(`${evidence.type} Evidence ${evidence.id}: ${evidence.evidenceUrl}`);
 *   });
 * }
 *
 * @example
 * // Handle case when no evidence is found
 * const result = await getEvidenceByUnitCodeAndUser('INVALID_CODE', 'user-123');
 * if (!result) {
 *   console.log('Unit code not found or user has no evidence');
 * }
 */
export async function getEvidenceByUnitCodeAndUser(unitCode: string, userId: string): Promise<UnitCodeEvidenceCollection | null> {
  try {
    // Validate input parameters
    if (!unitCode || !userId) {
      throw new Error("Unit code and user ID are required parameters");
    }

    // First, find the unit code and get its associated skills and knowledge
    const unitCodeData = await prismaTpqi.unitCode.findFirst({
      where: {
        code: unitCode,
      },
      select: {
        id: true,
        code: true,
        name: true,
        UnitSkill: {
          select: {
            skillId: true,
          },
        },
        UnitKnowledge: {
          select: {
            knowledgeId: true,
          },
        },
      },
    });

    // If unit code not found, return null
    if (!unitCodeData) {
      return null;
    }

    // Extract skill and knowledge IDs
    const skillIds = unitCodeData.UnitSkill.map((link: { skillId: number }) => link.skillId);
    const knowledgeIds = unitCodeData.UnitKnowledge.map((link: { knowledgeId: number }) => link.knowledgeId);

    // If no skills or knowledge found, return empty collection
    if (skillIds.length === 0 && knowledgeIds.length === 0) {
      return {
        unitCode,
        userId,
        evidences: [],
        skillEvidences: [],
        knowledgeEvidences: [],
        totalEvidences: 0,
      };
    }

    // Fetch user's skill evidences for this unit code (latest per skillId)
    const userSkillEvidences =
      skillIds.length > 0
        ? await Promise.all(
            skillIds.map(async (skillId: number) => {
              const latestEvidence = await prismaTpqi.userSkill.findFirst({
                where: {
                  userId: userId,
                  skillId: skillId,
                },
                orderBy: {
                  id: "desc", // Get the latest evidence
                },
                select: {
                  skillId: true,
                  evidenceUrl: true,
                  approvalStatus: true,
                },
              });
              return latestEvidence;
            })
          )
        : [];

    // Fetch user's knowledge evidences for this unit code (latest per knowledgeId)
    const userKnowledgeEvidences =
      knowledgeIds.length > 0
        ? await Promise.all(
            knowledgeIds.map(async (knowledgeId: number) => {
              const latestEvidence = await prismaTpqi.userKnowledge.findFirst({
                where: {
                  userId: userId,
                  knowledgeId: knowledgeId,
                },
                orderBy: {
                  id: "desc", // Get the latest evidence
                },
                select: {
                  knowledgeId: true,
                  evidenceUrl: true,
                  approvalStatus: true,
                },
              });
              return latestEvidence;
            })
          )
        : [];

    // Transform skill evidences (filter out null results)
    const skillEvidences: EvidenceInfo[] = userSkillEvidences
      .filter((evidence: any) => evidence !== null)
      .map((evidence: any) => ({
        id: evidence!.skillId,
        evidenceUrl: evidence!.evidenceUrl,
        approvalStatus: evidence!.approvalStatus,
        type: "skill" as const,
      }));

    // Transform knowledge evidences (filter out null results)
    const knowledgeEvidences: EvidenceInfo[] = userKnowledgeEvidences
      .filter((evidence: any) => evidence !== null)
      .map((evidence: any) => ({
        id: evidence!.knowledgeId,
        evidenceUrl: evidence!.evidenceUrl,
        approvalStatus: evidence!.approvalStatus,
        type: "knowledge" as const,
      }));

    // Combine all evidences
    const evidences: EvidenceInfo[] = [...skillEvidences, ...knowledgeEvidences];

    return {
      unitCode,
      userId,
      evidences,
      skillEvidences,
      knowledgeEvidences,
      totalEvidences: evidences.length,
    };
  } catch (error) {
    console.error("Error fetching evidence data:", error);
    throw new Error(`Failed to fetch evidence for unit code: ${unitCode} and user: ${userId}`);
  }
}

/**
 * Retrieves evidence collection for a specific unit code and user (legacy support).
 *
 * @deprecated Use getEvidenceByUnitCodeAndUser instead.
 * This function maintains backward compatibility but should be replaced in new code.
 */
export async function getUnitCodeEvidenceServices(unitCode: string, userId: string): Promise<UnitCodeEvidenceCollection | null> {
  return getEvidenceByUnitCodeAndUser(unitCode, userId);
}
