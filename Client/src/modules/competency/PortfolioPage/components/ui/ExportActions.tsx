import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { PortfolioData } from "modules/competency/PortfolioPage/types/portfolio";
import { generatePortfolioPdf } from "./PortfolioPdfGenerator";
import { useProfile } from "modules/competency/ProfilePage/hooks/useProfile";

interface ExportActionsProps {
  portfolioData: PortfolioData;
}

const ExportActions: React.FC<ExportActionsProps> = ({ portfolioData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { profileData, loadProfile } = useProfile();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      let userProfile = profileData;
      userProfile ??= await loadProfile();

      if (!userProfile) {
        throw new Error("Unable to load user profile data. Please ensure you are logged in and try again.");
      }

      await generatePortfolioPdf(portfolioData, userProfile);

      setTimeout(() => {
        alert("Professional CV PDF exported successfully!");
      }, 100);
    } catch (error) {
      console.error("PDF export failed:", error);
      const errorMessage = error instanceof Error ? error.message : "PDF export failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Export Professional CV</h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Download your portfolio as a professional CV-style PDF document</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="group relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 
                     bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold 
                     text-sm sm:text-base lg:text-lg rounded-xl transition-all duration-300 
                     transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl 
                     w-full max-w-xs sm:max-w-sm lg:max-w-md"
        >
          <div
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 
                          bg-white/20 rounded-lg flex-shrink-0"
          >
            <FaFilePdf className="text-lg sm:text-xl lg:text-2xl" />
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="font-bold text-sm sm:text-base lg:text-xl truncate">Export PDF</div>
            <div className="text-red-100 text-xs sm:text-sm truncate">Professional CV format</div>
          </div>

          {isExporting && (
            <div className="absolute inset-0 bg-red-600/80 rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <div
                  className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 
                                border-2 border-white border-t-transparent"
                ></div>
                <span className="font-medium text-xs sm:text-sm lg:text-base">Generating PDF...</span>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="mt-4 sm:mt-6 text-center text-gray-500 text-xs sm:text-sm">
        <p>Your professional CV will include all your competency data, skills assessment, and achievements.</p>
      </div>

      {/* Portfolio Statistics */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 text-center">Portfolio Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <div
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 
                          rounded-lg p-3 sm:p-4 text-center"
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{portfolioData.sfiaSkills.length}</div>
            <div className="text-xs sm:text-sm text-blue-700 font-medium">SFIA Skills</div>
          </div>
          <div
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 
                          rounded-lg p-3 sm:p-4 text-center"
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{portfolioData.tpqiCareers.length}</div>
            <div className="text-xs sm:text-sm text-green-700 font-medium">TPQI Careers</div>
          </div>
          <div
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 
                          rounded-lg p-3 sm:p-4 text-center"
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">{Math.round(portfolioData.overallStats.averageSfiaProgress)}%</div>
            <div className="text-xs sm:text-sm text-purple-700 font-medium">Avg SFIA Progress</div>
          </div>
          <div
            className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 
                          rounded-lg p-3 sm:p-4 text-center"
          >
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900">
              {Math.round((portfolioData.overallStats.averageTpqiSkillProgress + portfolioData.overallStats.averageTpqiKnowledgeProgress) / 2)}%
            </div>
            <div className="text-xs sm:text-sm text-orange-700 font-medium">Avg TPQI Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportActions;
