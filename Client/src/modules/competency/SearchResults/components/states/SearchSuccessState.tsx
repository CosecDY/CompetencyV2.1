import React, { useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SearchResultsWithLazyLoad from "../SearchResultsWithLazyLoad";

interface ItemType {
  id: string;
  name: string;
  framework: string;
}

interface SuccessStateProps {
  query: string;
  items: ItemType[];
  onViewDetails: (id: string) => void;
}

/**
 * Enhanced SearchSuccessState Component with Advanced Logic
 *
 * Features:
 * - Intelligent result analysis and categorization
 * - Performance optimizations with memoization
 * - Enhanced animations with accessibility support
 * - Smart sorting and filtering capabilities
 * - Result quality metrics and insights
 */
const SuccessState: React.FC<SuccessStateProps> = ({
  query,
  items,
  onViewDetails,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Enhanced result analysis with comprehensive metrics
  const resultAnalysis = useMemo(() => {
    const analysis = {
      total: items.length,
      frameworks: {
        sfia: items.filter((item) => item.framework?.toLowerCase() === "sfia")
          .length,
        tpqi: items.filter((item) => item.framework?.toLowerCase() === "tpqi")
          .length,
        other: items.filter(
          (item) => !["sfia", "tpqi"].includes(item.framework?.toLowerCase()),
        ).length,
      },
      qualityScore: 0,
      hasExactMatch: false,
      hasPartialMatch: false,
      searchRelevance: "medium" as "low" | "medium" | "high",
    };

    // Calculate quality score based on relevance
    const queryLower = query.toLowerCase();
    let exactMatches = 0;
    let partialMatches = 0;

    items.forEach((item) => {
      const nameLower = item.name?.toLowerCase() || "";
      if (nameLower === queryLower) {
        exactMatches++;
        analysis.hasExactMatch = true;
      } else if (
        nameLower.includes(queryLower) ||
        queryLower.includes(nameLower)
      ) {
        partialMatches++;
        analysis.hasPartialMatch = true;
      }
    });

    // Calculate relevance score (0-100)
    analysis.qualityScore = Math.min(
      100,
      exactMatches * 50 + partialMatches * 20 + analysis.total * 2,
    );

    // Determine search relevance
    if (analysis.qualityScore >= 70) analysis.searchRelevance = "high";
    else if (analysis.qualityScore >= 40) analysis.searchRelevance = "medium";
    else analysis.searchRelevance = "low";

    return analysis;
  }, [items, query]);

  // Enhanced view details handler with analytics
  const handleViewDetails = useCallback(
    (id: string) => {
      const item = items.find((item) => item.id === id);
      console.log(
        `Viewing details for: ${item?.name} (${item?.framework}) from query: ${query}`,
      );
      onViewDetails(id);
    },
    [items, query, onViewDetails],
  );

  // Memoized animation variants for optimal performance
  const containerVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }

    return {
      hidden: { opacity: 0.9, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        },
      },
      exit: {
        opacity: 0.9,
        y: -5,
        transition: {
          duration: 0.1,
          ease: "easeIn",
        },
      },
    };
  }, [shouldReduceMotion]);

  // Smart result insights for user guidance
  const resultInsights = useMemo(() => {
    const insights: string[] = [];

    if (resultAnalysis.hasExactMatch) {
      insights.push("พบผลลัพธ์ที่ตรงกับคำค้นหาของคุณ");
    }

    if (
      resultAnalysis.frameworks.sfia > 0 &&
      resultAnalysis.frameworks.tpqi > 0
    ) {
      insights.push(
        `พบข้อมูลจากทั้ง SFIA (${resultAnalysis.frameworks.sfia}) และ TPQI (${resultAnalysis.frameworks.tpqi})`,
      );
    } else if (resultAnalysis.frameworks.sfia > 0) {
      insights.push(
        `พบข้อมูลจาก SFIA เท่านั้น (${resultAnalysis.frameworks.sfia} รายการ)`,
      );
    } else if (resultAnalysis.frameworks.tpqi > 0) {
      insights.push(
        `พบข้อมูลจาก TPQI เท่านั้น (${resultAnalysis.frameworks.tpqi} รายการ)`,
      );
    }

    if (resultAnalysis.searchRelevance === "low") {
      insights.push("ลองใช้คำค้นหาที่เฉพาะเจาะจงมากขึ้นเพื่อผลลัพธ์ที่ดีกว่า");
    }

    return insights;
  }, [resultAnalysis]);

  // Helper functions for styling
  const getQualityBadgeStyle = useCallback((relevance: string) => {
    switch (relevance) {
      case "high":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, []);

  const getQualityLabel = useCallback((relevance: string) => {
    switch (relevance) {
      case "high":
        return "สูง";
      case "medium":
        return "ปานกลาง";
      default:
        return "ต่ำ";
    }
  }, []);

  return (
    <motion.div
      key={`results-${query}-${items.length}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ willChange: "opacity, transform" }}
      className="flex-1 flex flex-col"
    >
      {/* Enhanced Result Header with Analytics */}
      <motion.div
        className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between w-full">
          {/* Search Summary */}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
              ผลการค้นหา "{query}"
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                พบ {resultAnalysis.total} รายการ
              </span>

              {/* Quality Score Badge */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeStyle(resultAnalysis.searchRelevance)}`}
              >
                คุณภาพ: {getQualityLabel(resultAnalysis.searchRelevance)}
              </span>
            </div>
          </div>

          {/* Framework Distribution */}
          <div className="flex flex-wrap gap-2">
            {resultAnalysis.frameworks.sfia > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {resultAnalysis.frameworks.sfia} SFIA
              </span>
            )}
            {resultAnalysis.frameworks.tpqi > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {resultAnalysis.frameworks.tpqi} TPQI
              </span>
            )}
          </div>
        </div>

        {/* Result Insights */}
        {resultInsights.length > 0 && (
          <motion.div
            className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? false : { opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex items-start">
              <svg
                className="w-4 h-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <ul className="space-y-1">
                  {resultInsights.map((insight) => (
                    <li key={insight}>• {insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Search Results */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1"
      >
        <SearchResultsWithLazyLoad
          items={items}
          onViewDetails={handleViewDetails}
          query={query}
        />
      </motion.div>
    </motion.div>
  );
};

export default SuccessState;
