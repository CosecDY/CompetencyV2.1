import React from "react";
import { PortfolioData } from "modules/competency/PortfolioPage/types/portfolio";
import { PortfolioStats, ProgressChart } from "../charts";
import SfiaSection from "./SfiaSection";
import TpqiSection from "./TpqiSection";
import { ExportActions } from "../ui";
import { TabType } from "./NavigationTabs";

interface PortfolioContentProps {
  activeTab: TabType;
  portfolioData: PortfolioData;
}

const PortfolioContent: React.FC<PortfolioContentProps> = ({ activeTab, portfolioData }) => {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {activeTab === "overview" && (
        <div className="space-y-6 sm:space-y-8">
          <PortfolioStats stats={portfolioData.overallStats} />
          <ProgressChart portfolioData={portfolioData} />
          <ExportActions portfolioData={portfolioData} />
        </div>
      )}

      {activeTab === "sfia" && <SfiaSection sfiaSkills={portfolioData.sfiaSkills} />}

      {activeTab === "tpqi" && <TpqiSection tpqiCareers={portfolioData.tpqiCareers} />}
    </div>
  );
};

export default PortfolioContent;
