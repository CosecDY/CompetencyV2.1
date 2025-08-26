import React, { useState, useEffect } from "react";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Common/Background/WhiteTealBackground";

// Import portfolio-specific hook
import { usePortfolio } from "./hooks";

// Import components from organized structure
import LoadingState from "./components/states/LoadingState";
import ErrorState from "./components/states/ErrorState";
import NoDataState from "./components/states/NoDataState";
import PortfolioLayout from "./components/layout/PortfolioLayout";
import PortfolioHeader from "./components/layout/PortfolioHeader";
import RecommendationsPanel from "./components/ui/RecommendationsPanel";
import NavigationTabs, { TabType } from "./components/sections/NavigationTabs";
import PortfolioContent from "./components/sections/PortfolioContent";
import LastUpdatedFooter from "./components/ui/LastUpdatedFooter";

// AuthStates component for PortfolioPage
const AuthStates: React.FC = () => {
  return (
    <Layout>
      <WhiteTealBackground>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center py-20">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center space-x-3">
                <i className="fas fa-exclamation-circle text-yellow-500 text-xl"></i>
                <div>
                  <h3 className="text-yellow-800 font-medium">กรุณาเข้าสู่ระบบ</h3>
                  <p className="text-yellow-600 text-sm">คุณจำเป็นต้องเข้าสู่ระบบเพื่อเข้าถึงหน้าพอร์ตโฟลิโอของคุณ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

const PortfolioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user } = useAuth();

  // Use the portfolio hook with real API integration
  const { portfolioData, loading, error, hasData, fetchPortfolioData, refreshPortfolio, recommendations, clearError, lastFetched, isDataStale } = usePortfolio();

  // Fetch portfolio data when user is available
  useEffect(() => {
    if (user?.email) {
      fetchPortfolioData(user.email);
    }
  }, [user?.email, fetchPortfolioData]);

  // AuthStates for PortfolioPage
  if (!user) {
    return <AuthStates />;
  }

  // Handle refresh
  const handleRefresh = () => {
    if (user?.email) {
      refreshPortfolio(user.email);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState lastFetched={lastFetched} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} onDismiss={clearError} />;
  }

  // No data state
  if (!hasData) {
    return <NoDataState recommendations={recommendations} onRefresh={handleRefresh} />;
  }

  // Main portfolio view
  return (
    <PortfolioLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-4">
        {/* Header Section */}
        <div className="w-full">
          <PortfolioHeader userEmail={portfolioData?.userEmail || user?.email || ""} isDataStale={isDataStale} loading={loading} onRefresh={handleRefresh} lastUpdated={lastFetched} />
        </div>

        {/* Recommendations Section */}
        <div className="w-full">
          <RecommendationsPanel recommendations={recommendations} />
        </div>

        {/* Navigation Section */}
        <div className="w-full overflow-x-auto">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} sfiaSkillsCount={portfolioData?.sfiaSkills.length || 0} tpqiCareersCount={portfolioData?.tpqiCareers.length || 0} />
        </div>

        {/* Content Section */}
        <div className="w-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">{portfolioData && <PortfolioContent activeTab={activeTab} portfolioData={portfolioData} />}</div>

        {/* Footer Section */}
        <div className="w-full">
          <LastUpdatedFooter lastFetched={lastFetched} />
        </div>
      </div>
    </PortfolioLayout>
  );
};

export default PortfolioPage;
