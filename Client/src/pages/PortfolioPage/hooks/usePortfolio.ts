import { useState, useCallback, useMemo } from "react";
import { PortfolioService, CompletePortfolioData } from "@Services/portfolio/portfolioService";
import { PortfolioData } from "@Types/portfolio";

/**
 * Custom hook for managing portfolio data.
 * Handles fetching, loading states, and error handling for portfolio information.
 */
export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [completeData, setCompleteData] = useState<CompletePortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Initialize the portfolio service with memoization
  const portfolioService = useMemo(() => {
    return new PortfolioService();
  }, []);

  /**
   * Fetches portfolio data from the API.
   * @param userEmail - The user's email address
   */
  const fetchPortfolioData = useCallback(
    async (userEmail: string) => {
      try {
        setLoading(true);
        setError(null);

        // Validate service configuration
        const validation = portfolioService.validateServiceConfig();
        if (!validation.isValid) {
          throw new Error(validation.error || "Service configuration is invalid");
        }

        // Fetch complete portfolio data
        const completePortfolio = await portfolioService.getCompletePortfolioData(userEmail);
        setCompleteData(completePortfolio);

        // Convert to UI format
        const uiPortfolio = portfolioService.convertToPortfolioData(completePortfolio);
        setPortfolioData(uiPortfolio);
        setLastFetched(new Date());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch portfolio data";
        setError(errorMessage);
        console.error("Error fetching portfolio data:", err);
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  /**
   * Refreshes the portfolio data.
   * @param userEmail - The user's email address
   */
  const refreshPortfolio = useCallback(
    (userEmail: string) => {
      return fetchPortfolioData(userEmail);
    },
    [fetchPortfolioData]
  );

  /**
   * Checks if portfolio data exists.
   */
  const hasData = portfolioData !== null && (portfolioData.sfiaSkills.length > 0 || portfolioData.tpqiCareers.length > 0);

  /**
   * Gets recommendations based on current portfolio data.
   */
  const recommendations = completeData ? portfolioService.generateRecommendations(completeData) : [];

  /**
   * Checks if data is stale (older than 5 minutes).
   */
  const isDataStale = lastFetched ? new Date().getTime() - lastFetched.getTime() > 5 * 60 * 1000 : true;

  return {
    // Data
    portfolioData,
    completeData,

    // State
    loading,
    error,
    hasData,
    lastFetched,
    isDataStale,

    // Actions
    fetchPortfolioData,
    refreshPortfolio,

    // Additional features
    recommendations,

    // Utilities
    clearError: () => setError(null),
    reset: () => {
      setPortfolioData(null);
      setCompleteData(null);
      setError(null);
      setLastFetched(null);
    },
  };
};
