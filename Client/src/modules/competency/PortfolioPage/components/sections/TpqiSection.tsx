import React from "react";
import { FaChartBar, FaInfoCircle, FaBriefcase } from "react-icons/fa";
import { TpqiSummary } from "modules/competency/PortfolioPage/types/portfolio";

interface TpqiSectionProps {
  tpqiCareers: TpqiSummary[];
}

const TpqiSection: React.FC<TpqiSectionProps> = ({ tpqiCareers }) => {
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
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-light text-slate-800 mb-2">TPQI Career Framework</h2>
          <p className="text-slate-600 font-light">Thai Professional Qualification Institute (TPQI) career competencies</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <FaInfoCircle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-medium">Career Assessment</span>
        </div>
      </div>

      {tpqiCareers.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-12 text-center border border-slate-200">
          <div className="bg-slate-100 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FaBriefcase className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No TPQI Career Assessment Available</h3>
          <p className="text-slate-500 font-light">Complete your career assessment to see your TPQI competencies here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tpqiCareers.map((careerSummary) => (
            <div
              key={careerSummary.id}
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800 mb-2">{careerSummary.career?.name || "Unknown Career"}</h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-200">{careerSummary.level?.name || "Unknown Level"}</span>
                  </div>
                </div>
              </div>

              {/* Skills Progress */}
              <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Skills</span>
                  <span className="text-sm text-slate-800 font-medium">{careerSummary.skillPercent ? Math.round(careerSummary.skillPercent) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 shadow-sm ${getSkillLevelColor(careerSummary.skillPercent)}`}
                    style={{
                      width: `${Math.min(careerSummary.skillPercent || 0, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">{getSkillLevelText(careerSummary.skillPercent)}</div>
              </div>

              {/* Knowledge Progress */}
              <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Knowledge</span>
                  <span className="text-sm text-slate-800 font-medium">{careerSummary.knowledgePercent ? Math.round(careerSummary.knowledgePercent) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 shadow-sm ${getSkillLevelColor(careerSummary.knowledgePercent)}`}
                    style={{
                      width: `${Math.min(careerSummary.knowledgePercent || 0, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">{getSkillLevelText(careerSummary.knowledgePercent)}</div>
              </div>

              {/* Refined Action Button */}
              <div className="pt-4 border-t border-slate-200">
                <button className="group flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-300 w-full border border-slate-200 hover:border-slate-300">
                  <FaChartBar className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>View Career Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refined Summary Stats */}
      {tpqiCareers.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-5">TPQI Career Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
              <div className="text-2xl font-light text-purple-700 mb-1">{tpqiCareers.length}</div>
              <div className="text-sm text-purple-600 font-medium">Total Careers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
              <div className="text-2xl font-light text-blue-700 mb-1">{Math.round(tpqiCareers.reduce((sum, career) => sum + (career.skillPercent || 0), 0) / tpqiCareers.length)}%</div>
              <div className="text-sm text-blue-600 font-medium">Avg Skills Progress</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
              <div className="text-2xl font-light text-emerald-700 mb-1">{Math.round(tpqiCareers.reduce((sum, career) => sum + (career.knowledgePercent || 0), 0) / tpqiCareers.length)}%</div>
              <div className="text-sm text-emerald-600 font-medium">Avg Knowledge Progress</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-orange-200 shadow-sm">
              <div className="text-2xl font-light text-orange-700 mb-1">{tpqiCareers.filter((career) => (career.skillPercent || 0) >= 80 && (career.knowledgePercent || 0) >= 80).length}</div>
              <div className="text-sm text-orange-600 font-medium">Expert Careers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TpqiSection;
