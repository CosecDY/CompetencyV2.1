import { prismaSfia } from "../../../db/prismaClients";

/**
 * Skill detail information including competency data and hierarchical structure.
 *
 * @interface SkillDetail
 * @property {string} competency_id - Unique skill code identifier.
 * @property {string|null} competency_name - Display name of the skill competency.
 * @property {string|null} overall - Overall description or overview of the skill.
 * @property {string|null} note - Additional notes or remarks about the skill.
 * @property {Object|null} category - Category information containing id and descriptive text.
 * @property {Array} levels - Array of skill levels with their descriptions and subskills.
 */
export interface SkillDetail {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  category: {
    id: number;
    category_text: string | null;
  } | null;
  levels: Array<{
    id: number;
    level_name: string | null;
    descriptions: Array<{
      id: number;
      description_text: string | null;
      subskills: Array<{
        id: number;
        subskill_text: string | null;
      }>;
    }>;
  }>;
}

/**
 * Complete skill information with statistical summary.
 *
 * @interface SkillSubSkillsAndLevels
 * @property {SkillDetail|null} competency - Detailed skill information with hierarchical structure.
 * @property {number} totalLevels - Total count of skill levels available.
 * @property {number} totalSubSkills - Total count of subskills across all levels and descriptions.
 */
export interface SkillSubSkillsAndLevels {
  competency: SkillDetail | null;
  totalLevels: number;
  totalSubSkills: number;
}

/**
 * Retrieves comprehensive skill details including levels, descriptions, and subskills by skill code.
 * 
 * This function performs a complex database query to fetch a complete skill hierarchy including:
 * - Basic skill information (name, overview, notes)
 * - Category classification
 * - All skill levels with their descriptions
 * - All subskills under each description
 * - Statistical counts for levels and subskills
 *
 * @async
 * @function getSkillDetailsByCode
 * @param {string} skill_code - The unique skill code to search for (e.g., 'PROG', 'DTAN').
 * @returns {Promise<SkillSubSkillsAndLevels|null>} Complete skill data with statistics, or null if not found.
 * 
 * @throws {Error} If database query fails or skill code format is invalid.
 * 
 * @example
 * // Retrieve skill details for programming competency
 * const skillData = await getSkillDetailsByCode('PROG');
 * if (skillData) {
 *   console.log(`Skill: ${skillData.competency?.competency_name}`);
 *   console.log(`Total Levels: ${skillData.totalLevels}`);
 *   console.log(`Total SubSkills: ${skillData.totalSubSkills}`);
 *   
 *   // Access first level's first description's subskills
 *   const subskills = skillData.competency?.levels[0]?.descriptions[0]?.subskills;
 *   subskills?.forEach(subskill => {
 *     console.log(`- ${subskill.subskill_text}`);
 *   });
 * }
 * 
 * @example
 * // Handle case when skill is not found
 * const result = await getSkillDetailsByCode('INVALID_CODE');
 * if (!result) {
 *   console.log('Skill not found or has no associated levels/descriptions');
 * }
 */
export async function getSkillDetailsByCode(
  skill_code: string
): Promise<SkillSubSkillsAndLevels | null> {
  try {
    // Query skill data with all related hierarchical information
    const skillData = await prismaSfia.skill.findFirst({
      where: {
        code: skill_code,
        levels: {
          some: {
            descriptions: {
              some: {},
            },
          },
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        levels: {
          where: {
            descriptions: {
              some: {},
            },
          },
          include: {
            descriptions: {
              include: {
                subSkills: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    // If no skill data found, return null
    if (!skillData) {
      return null;
    }

    // Transform the raw database result to match our interface
    const transformedSkill: SkillDetail = {
      competency_id: skillData.code,
      competency_name: skillData.name,
      overall: skillData.overview,
      note: skillData.note?.replace(/\s+/g, " ").trim() || null,
      category: skillData.category
        ? {
            id: skillData.category.id,
            category_text: skillData.category.name,
          }
        : null,
      levels: skillData.levels.map((level: any) => ({
        id: level.id,
        level_name: level.name,
        descriptions: level.descriptions.map((desc: any) => ({
          id: desc.id,
          description_text: desc.text?.replace(/\s+/g, " ").trim() || null,
          subskills: desc.subSkills.map((subskill: any) => ({
            id: subskill.id,
            subskill_text: subskill.text?.replace(/\s+/g, " ").trim() || null,
          })),
        })),
      })),
    };

    // Calculate statistical totals for the skill
    const totalLevels = skillData.levels.length;
    const totalSubSkills = skillData.levels.reduce(
      (total: number, level: any) => {
        return (
          total +
          level.descriptions.reduce((descTotal: number, desc: any) => {
            return descTotal + desc.subSkills.length;
          }, 0)
        );
      },
      0
    );

    return {
      competency: transformedSkill,
      totalLevels,
      totalSubSkills,
    };
  } catch (error) {
    console.error("Error fetching skill details:", error);
    throw new Error(`Failed to fetch skill details for code: ${skill_code}`);
  }
}

/**
 * @deprecated Use SkillSubSkillsAndLevels instead.
 * @typedef {SkillSubSkillsAndLevels} SkillSkillsAndLevels
 */
// For backward compatibility, also export with the old name
export type SkillSkillsAndLevels = SkillSubSkillsAndLevels;

