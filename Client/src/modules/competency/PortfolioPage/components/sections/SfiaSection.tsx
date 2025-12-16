import React from "react";
import { FaCog, FaChartBar, FaInfoCircle } from "react-icons/fa";
import { SfiaSummary } from "modules/competency/PortfolioPage/types/portfolio";

interface SfiaSectionProps {
  sfiaSkills: SfiaSummary[];
}

const SfiaSection: React.FC<SfiaSectionProps> = ({ sfiaSkills }) => {
  const getSkillLevelColor = (percentage: number | null) => {
    if (!percentage) return "bg-gray-200";
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSkillLevelText = (percentage: number | null) => {
    if (!percentage) return "Not Started";
    if (percentage >= 80) return "Expert";
    if (percentage >= 60) return "Proficient";
    if (percentage >= 40) return "Developing";
    return "Beginner";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
        <div className="flex-1 mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-light text-slate-800 mb-2">SFIA Skills Framework</h2>
          <p className="text-slate-600 font-light text-sm sm:text-base">Skills for the Information Age (SFIA) professional competencies</p>
        </div>
        <div
          className="flex items-center space-x-2 sm:space-x-3 bg-slate-50 px-3 sm:px-4 py-2 
                        rounded-xl border border-slate-200 self-start"
        >
          <FaInfoCircle className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-slate-600 font-medium">Framework Assessment</span>
        </div>
      </div>

      {sfiaSkills.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
          <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <FaCog className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-slate-700 mb-2">No SFIA Skills Assessment Available</h3>
          <p className="text-slate-500 font-light text-sm sm:text-base">Complete your skills assessment to view your SFIA competency profile here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {sfiaSkills.map((skillSummary) => (
            <div
              key={skillSummary.id}
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 
                         p-4 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 
                         hover:-translate-y-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-5">
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2">{skillSummary.skill?.name || "Unknown Skill"}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-blue-200">{skillSummary.skillCode}</span>
                    <span className="text-slate-400 hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm text-slate-600 font-light">{skillSummary.level?.name || "Unknown Level"}</span>
                  </div>
                  {skillSummary.skill?.overview && <p className="text-xs sm:text-sm text-slate-600 font-light line-clamp-2 leading-relaxed">{skillSummary.skill.overview}</p>}
                </div>
                <div
                  className="sm:ml-4 bg-slate-50 rounded-xl p-3 sm:p-4 text-center border border-slate-200 
                                self-start sm:self-auto"
                >
                  <div className="text-xl sm:text-2xl font-light text-slate-800 mb-1">{skillSummary.skillPercent ? Math.round(skillSummary.skillPercent) : 0}%</div>
                  <div className="text-xs text-slate-500 font-medium">{getSkillLevelText(skillSummary.skillPercent)}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 sm:mb-5">
                <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 shadow-sm ${getSkillLevelColor(skillSummary.skillPercent)}`}
                    style={{
                      width: `${Math.min(skillSummary.skillPercent || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Skill Category */}
              {skillSummary.skill?.category && (
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
                    <span className="text-slate-600 font-medium">Category:</span>
                    <span className="font-medium text-slate-700">{skillSummary.skill.category.name}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  className="group flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 
                                   hover:bg-slate-50 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-3 
                                   rounded-xl transition-all duration-300 w-full border border-slate-200 hover:border-slate-300"
                >
                  <FaChartBar className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
                  <span>View Detailed Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {sfiaSkills.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
          <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-4 sm:mb-5">SFIA Skills Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
              <div className="text-xl sm:text-2xl font-light text-blue-700 mb-1">{sfiaSkills.length}</div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Total Skills Assessed</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
              <div className="text-xl sm:text-2xl font-light text-emerald-700 mb-1">{Math.round(sfiaSkills.reduce((sum, skill) => sum + (skill.skillPercent || 0), 0) / sfiaSkills.length)}%</div>
              <div className="text-xs sm:text-sm text-emerald-600 font-medium">Average Proficiency</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
              <div className="text-xl sm:text-2xl font-light text-purple-700 mb-1">{sfiaSkills.filter((skill) => (skill.skillPercent || 0) >= 80).length}</div>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">Expert Level Skills</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SfiaSection;
