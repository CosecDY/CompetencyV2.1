import api from "@Services/api";
import axios from "axios";
import { ApiResponse } from "@Types/competency/ApiResponse";

/**
 * Interface for SFIA skill summary data from the backend.
 */
export interface SfiaSkillSummary {
  id: number;
  skillCode: string;
  skillName: string;
  categoryName: string;
  levelId: number;
  levelName: string;
  skillPercent: number;
}

/**
 * Interface for the overall SFIA summary statistics.
 */
export interface SfiaSummaryStats {
  totalSkills: number;
  averagePercent: number; // Changed from avgSkillPercent to match API
  completedSkills: number;
  skillSummaries: SfiaSkillSummary[];
}

/**
 * Extended API response for SFIA summary retrieval.
 */
export interface GetSfiaSummaryResponse extends ApiResponse {
  data?: SfiaSummaryStats;
}

/**
 * Service class for retrieving SFIA user summary.
 * Handles API requests and basic client-side validations.
 */
export class GetSfiaSummaryService {
  /**
   * Retrieves the SFIA summary for the authenticated user.
   *
   * @returns Promise<GetSfiaSummaryResponse>
   * @throws Error if the API request fails
   */
  async getUserSummary(): Promise<GetSfiaSummaryResponse> {
    try {
      const response = await api.get<GetSfiaSummaryResponse>("/sfia/summary/user");
      return response.data;
    } catch (error: unknown) {
      // Gracefully handle 404: treat as empty portfolio instead of an error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const empty: SfiaSummaryStats = {
          totalSkills: 0,
          averagePercent: 0,
          completedSkills: 0,
          skillSummaries: [],
        };
        return { success: true, data: empty };
      }

      // Other errors: propagate with friendly message
      const message = axios.isAxiosError(error) ? error.response?.data?.message || "Failed to fetch SFIA summary" : "Failed to fetch SFIA summary";
      console.error("Error fetching SFIA summary:", message);
      throw new Error(message);
    }
  }

  /**
   * Checks if the response contains valid summary data.
   */
  hasSummaryData(response: GetSfiaSummaryResponse): boolean {
    const data = response.data;
    return Boolean(response.success && data && Array.isArray(data.skillSummaries) && data.skillSummaries.length > 0);
  }

  /**
   * Calculates additional statistics from the summary data.
   */
  calculateAdditionalStats(summaryData: SfiaSummaryStats): {
    highPerformanceSkills: SfiaSkillSummary[];
    skillsByCategory: Map<string, SfiaSkillSummary[]>;
    averageByLevel: Map<string, number>;
  } {
    const highPerformanceSkills = summaryData.skillSummaries.filter((skill) => skill.skillPercent >= 80);

    const skillsByCategory = new Map<string, SfiaSkillSummary[]>();
    summaryData.skillSummaries.forEach((skill) => {
      const categoryName = skill.categoryName;
      if (!skillsByCategory.has(categoryName)) skillsByCategory.set(categoryName, []);
      skillsByCategory.get(categoryName)!.push(skill);
    });

    const averageByLevel = new Map<string, number>();
    const levelGroups = new Map<string, number[]>();

    summaryData.skillSummaries.forEach((skill) => {
      const levelName = skill.levelName;
      if (!levelGroups.has(levelName)) levelGroups.set(levelName, []);
      levelGroups.get(levelName)!.push(skill.skillPercent);
    });

    levelGroups.forEach((percentages, levelName) => {
      const average = percentages.reduce((sum, percent) => sum + percent, 0) / percentages.length;
      averageByLevel.set(levelName, Math.round(average * 100) / 100);
    });

    return {
      highPerformanceSkills,
      skillsByCategory,
      averageByLevel,
    };
  }

  /**
   * Formats the summary data for display purposes.
   */
  formatSummaryForDisplay(summaryData: SfiaSummaryStats): {
    formattedSkills: Array<{
      skillCode: string;
      skillName: string;
      category: string;
      level: string;
      progress: number;
      progressFormatted: string;
    }>;
    overallProgress: string;
    completionRate: string;
  } {
    const formattedSkills = summaryData.skillSummaries.map((skill) => ({
      skillCode: skill.skillCode,
      skillName: skill.skillName,
      category: skill.categoryName,
      level: skill.levelName,
      progress: skill.skillPercent,
      progressFormatted: `${skill.skillPercent}%`,
    }));

    const overallProgress = `${summaryData.averagePercent}%`;
    const completionRate = `${summaryData.completedSkills}/${summaryData.totalSkills}`;

    return { formattedSkills, overallProgress, completionRate };
  }
}
