import { PortfolioData } from "modules/competency/PortfolioPage/types/portfolio";

/**
 * Portfolio utility functions
 */

// Calculate overall progress percentages
export const calculateOverallProgress = (portfolioData: PortfolioData) => {
  const { overallStats } = portfolioData;

  return {
    sfiaProgress: Math.round(overallStats.averageSfiaProgress),
    tpqiProgress: Math.round((overallStats.averageTpqiSkillProgress + overallStats.averageTpqiKnowledgeProgress) / 2),
    combinedProgress: Math.round((overallStats.averageSfiaProgress + (overallStats.averageTpqiSkillProgress + overallStats.averageTpqiKnowledgeProgress) / 2) / 2),
  };
};

// Format progress for display
export const formatProgress = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Check if data is stale (older than 1 hour)
export const isDataStale = (lastFetched: Date | null): boolean => {
  if (!lastFetched) return false;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return lastFetched < oneHourAgo;
};

// Generate recommendations based on portfolio data
export const generateRecommendations = (portfolioData: PortfolioData): string[] => {
  const recommendations: string[] = [];
  const { overallStats } = portfolioData;

  if (overallStats.totalSfiaSkills === 0) {
    recommendations.push("Start with SFIA competency assessments to build your skills profile");
  }

  if (overallStats.totalTpqiCareers === 0) {
    recommendations.push("Explore TPQI career pathways to define your professional direction");
  }

  if (overallStats.averageSfiaProgress < 50) {
    recommendations.push("Focus on improving your SFIA skill competencies");
  }

  if ((overallStats.averageTpqiSkillProgress + overallStats.averageTpqiKnowledgeProgress) / 2 < 50) {
    recommendations.push("Consider additional training to enhance your TPQI competencies");
  }

  if (recommendations.length === 0) {
    recommendations.push("Great progress! Continue developing your professional competencies");
  }

  return recommendations;
};

// Color schemes for consistent theming
export const colorSchemes = {
  sfia: {
    primary: "bg-blue-500",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  tpqi: {
    primary: "bg-green-500",
    secondary: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  skills: {
    primary: "bg-purple-500",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  knowledge: {
    primary: "bg-orange-500",
    secondary: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
} as const;

// Export default color scheme getter
export const getColorScheme = (type: keyof typeof colorSchemes) => {
  return colorSchemes[type];
};
