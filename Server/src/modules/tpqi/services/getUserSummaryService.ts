import { prismaTpqi, prismaCompetency } from "@/db/prismaClients";

/**
 * Individual career summary information for a user.
 *
 * @interface CareerSummaryInfo
 * @property {number} id - Unique identifier of the summary.
 * @property {number} careerId - ID of the career.
 * @property {string|null} careerName - Name of the career.
 * @property {number} levelId - Level ID of the career.
 * @property {string|null} levelName - Name of the level.
 * @property {number} careerLevelId - Career level ID.
 * @property {number|null} skillPercent - Percentage completion of skills.
 * @property {number|null} knowledgePercent - Percentage completion of knowledge.
 */
export interface CareerSummaryInfo {
  id: number;
  careerId: number;
  careerName: string | null;
  levelId: number;
  levelName: string | null;
  careerLevelId: number;
  skillPercent: number | null;
  knowledgePercent: number | null;
}

/**
 * Complete user career summary collection with statistical information.
 *
 * @interface UserCareerSummaryCollection
 * @property {CareerSummaryInfo[]} careerSummaries - Array of career summary information.
 * @property {number} totalCareers - Total count of careers found.
 * @property {number} averageSkillPercent - Average skill completion percentage across all careers.
 * @property {number} averageKnowledgePercent - Average knowledge completion percentage across all careers.
 * @property {number} completedCareers - Number of careers with 100% completion (both skills and knowledge).
 */
export interface UserCareerSummaryCollection {
  careerSummaries: CareerSummaryInfo[];
  totalCareers: number;
  averageSkillPercent: number;
  averageKnowledgePercent: number;
  completedCareers: number;
}

/**
 * Retrieves comprehensive career summary collection for a specific user.
 *
 * This function performs a complex database query to fetch summary data including:
 * - All career summaries associated with the user
 * - Career details with names and levels
 * - Skill and knowledge completion percentages
 * - Statistical analysis of user's career progression
 *
 * @async
 * @function getUserCareerSummaryByUserId
 * @param {string} userId - The unique user identifier to filter summaries by.
 * @returns {Promise<UserCareerSummaryCollection|null>} Complete summary collection with statistics, or null if no summaries found.
 *
 * @throws {Error} If database query fails or parameters are invalid.
 *
 * @example
 * // Retrieve career summary for a specific user
 * const summaryData = await getUserCareerSummaryByUserId('user-123');
 * if (summaryData) {
 *   console.log(`User has ${summaryData.totalCareers} careers with ${summaryData.averageSkillPercent}% average skill completion`);
 *   summaryData.careerSummaries.forEach(career => {
 *     console.log(`${career.careerName}: Skills ${career.skillPercent}%, Knowledge ${career.knowledgePercent}%`);
 *   });
 * }
 *
 * @example
 * // Handle case when no summaries are found
 * const result = await getUserCareerSummaryByUserId('unknown-user');
 * if (!result) {
 *   console.log('No career summaries found for this user');
 * }
 */
export async function getUserCareerSummaryByUserId(userId: string): Promise<UserCareerSummaryCollection | null> {
  try {
    // Validate input parameters
    if (!userId) {
      throw new Error("User ID is required parameter");
    }

    // First, get the user's email from the competency database
    const user = await prismaCompetency.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new Error(`User not found or email missing for userId: ${userId}`);
    }

    // Query user career summaries with all related information using the email
    const summaryData = await prismaTpqi.tpqiSummary.findMany({
      where: {
        userEmail: user.email, // Use the email from competency database
      },
      include: {
        career: true,
        level: true,
        careerLevel: true,
      },
      orderBy: [{ skillPercent: "desc" }, { knowledgePercent: "desc" }, { careerId: "asc" }],
    });

    // If no summaries found, return null
    if (!summaryData || summaryData.length === 0) {
      return null;
    }

    // Transform the raw database result to match our interface
    const careerSummaries: CareerSummaryInfo[] = summaryData.map((summary) => ({
      id: summary.id,
      careerId: summary.careerId,
      careerName: summary.career?.name || null,
      levelId: summary.levelId,
      levelName: summary.level?.name || null,
      careerLevelId: summary.careerLevelId,
      skillPercent: summary.skillPercent ? Number(summary.skillPercent) : null,
      knowledgePercent: summary.knowledgePercent ? Number(summary.knowledgePercent) : null,
    }));

    // Calculate statistics
    const validSkillPercentages = careerSummaries.map((career) => career.skillPercent).filter((percent): percent is number => percent !== null);

    const validKnowledgePercentages = careerSummaries.map((career) => career.knowledgePercent).filter((percent): percent is number => percent !== null);

    const totalCareers = careerSummaries.length;

    const averageSkillPercent = validSkillPercentages.length > 0 ? Math.round((validSkillPercentages.reduce((sum, percent) => sum + percent, 0) / validSkillPercentages.length) * 100) / 100 : 0;

    const averageKnowledgePercent =
      validKnowledgePercentages.length > 0 ? Math.round((validKnowledgePercentages.reduce((sum, percent) => sum + percent, 0) / validKnowledgePercentages.length) * 100) / 100 : 0;

    const completedCareers = careerSummaries.filter((career) => career.skillPercent === 100 && career.knowledgePercent === 100).length;

    return {
      careerSummaries,
      totalCareers,
      averageSkillPercent,
      averageKnowledgePercent,
      completedCareers,
    };
  } catch (error) {
    console.error("Error fetching user career summary data:", error);
    throw new Error(`Failed to fetch career summary for user: ${userId}`);
  }
}
