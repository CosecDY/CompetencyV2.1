import React from "react";
import { FaChartBar, FaCog, FaGraduationCap } from "react-icons/fa";

export type TabType = "overview" | "sfia" | "tpqi";

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sfiaSkillsCount: number;
  tpqiCareersCount: number;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange, sfiaSkillsCount, tpqiCareersCount }) => {
  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: FaChartBar,
      description: "Portfolio summary and insights",
      count: null,
    },
    {
      id: "sfia" as TabType,
      label: "SFIA Skills",
      icon: FaCog,
      description: "Skills Framework for the Information Age",
      count: sfiaSkillsCount,
    },
    {
      id: "tpqi" as TabType,
      label: "TPQI Careers",
      icon: FaGraduationCap,
      description: "Career pathways and qualifications",
      count: tpqiCareersCount,
    },
  ];

  const getTabClassName = (tab: TabType) => {
    const isActive = activeTab === tab;
    return `group relative flex items-center justify-between w-full p-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50 ${
      isActive
        ? "bg-slate-800 text-white shadow-lg shadow-slate-500/20 hover:shadow-xl hover:shadow-slate-500/30"
        : "bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-lg hover:shadow-slate-300/50 border border-slate-200 hover:border-slate-300"
    }`;
  };

  const getIconClassName = (tab: TabType) => {
    const isActive = activeTab === tab;
    return `h-5 w-5 transition-all duration-300 group-hover:scale-110 ${isActive ? "text-white group-hover:drop-shadow-sm" : "text-slate-500 group-hover:text-slate-700 group-hover:rotate-3"}`;
  };

  const getBadgeClassName = (tab: TabType) => {
    const isActive = activeTab === tab;
    return `px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
      isActive ? "bg-white/20 text-white group-hover:bg-white/30" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:shadow-sm"
    }`;
  };

  return (
    <div className="w-full p-4">
      {/* Header */}
      <div className="p-2 mb-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Navigation</h2>
        <p className="text-slate-600">Explore your competencies and career development</p>
      </div>

      {/* Tabs Container */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 backdrop-blur-sm border border-slate-300 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <nav className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)} className={getTabClassName(tab.id)} aria-label={`Switch to ${tab.label} tab`} role="tab" aria-selected={isActive}>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                      isActive ? "bg-white/20 group-hover:bg-white/30" : "bg-slate-100 group-hover:bg-slate-200 group-hover:shadow-md"
                    }`}
                  >
                    <Icon className={getIconClassName(tab.id)} />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-semibold text-sm sm:text-base truncate transition-all duration-300 group-hover:tracking-wide ${isActive ? "text-white" : "text-slate-700"}`}>{tab.label}</div>
                    <div
                      className={`text-xs mt-0.5 truncate hidden sm:block transition-all duration-300 group-hover:text-opacity-90 ${
                        isActive ? "text-white/80" : "text-slate-500 group-hover:text-slate-600"
                      }`}
                    >
                      {tab.description}
                    </div>
                  </div>
                </div>

                {tab.count !== null && (
                  <div className="flex-shrink-0 ml-2">
                    <span className={getBadgeClassName(tab.id)}>{tab.count}</span>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-90 transition-all duration-300 group-hover:w-12 group-hover:h-1.5"></div>
                )}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center space-x-2">
        {tabs.map((tab) => (
          <div key={tab.id} className={`h-1 w-8 rounded-full transition-all duration-300 ${activeTab === tab.id ? "bg-slate-600" : "bg-slate-300"}`} />
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
