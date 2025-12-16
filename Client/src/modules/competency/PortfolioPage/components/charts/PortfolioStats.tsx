import React from "react";
import { FaCog, FaGraduationCap, FaChartBar } from "react-icons/fa";

interface OverallStats {
  totalSfiaSkills: number;
  totalTpqiCareers: number;
  averageSfiaProgress: number;
  averageTpqiSkillProgress: number;
  averageTpqiKnowledgeProgress: number;
}

interface PortfolioStatsProps {
  stats: OverallStats;
}

const PortfolioStats: React.FC<PortfolioStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "SFIA Skills Assessment",
      value: stats.totalSfiaSkills,
      progress: stats.averageSfiaProgress,
      icon: FaCog,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    {
      title: "TPQI Career Paths",
      value: stats.totalTpqiCareers,
      progress:
        (stats.averageTpqiSkillProgress + stats.averageTpqiKnowledgeProgress) /
        2,
      icon: FaGraduationCap,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-light text-slate-800 mb-2">
            Portfolio Overview
          </h2>
          <p className="text-slate-600 font-light text-sm sm:text-base">
            Comprehensive view of your professional competencies
          </p>
        </div>
        <div
          className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-3 shadow-sm 
                        self-start sm:self-auto"
        >
          <FaChartBar className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.bgColor} rounded-2xl p-4 sm:p-6 border ${card.borderColor} 
                         hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-gradient-to-br ${card.color} rounded-xl p-2 sm:p-3 shadow-sm flex-shrink-0`}
                >
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-right ml-3">
                  <p className="text-xl sm:text-2xl font-light text-slate-800 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {card.title}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-white/60 rounded-full h-2 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${card.color} h-2 rounded-full transition-all duration-700 shadow-sm`}
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${card.textColor}`}>
                    {Math.round(card.progress)}% Complete
                  </span>
                  <span className="text-xs text-slate-500 font-light">
                    Professional Level
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioStats;
