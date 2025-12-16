import React from "react";

interface RecommendationsPanelProps {
  recommendations: string[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm h-auto min-h-[120px]">
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-5">
          <div className="bg-blue-100 rounded-xl p-2 sm:p-3 shadow-sm flex-shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800 text-base sm:text-lg mb-1">
              Professional Development Recommendations
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-light">
              Tailored suggestions to enhance your competency profile
            </p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-5 border border-blue-100">
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={`recommendation-${rec.slice(0, 30)}-${index}`} className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                </div>
                <span className="text-slate-700 text-xs sm:text-sm leading-relaxed font-light break-words">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
