import { useState, useCallback, useMemo } from "react";
import { PortfolioService, PortfolioListItem } from "../services/portfolioService";
import { PortfolioData } from "../types/portfolio";

export const usePortfolio = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [portfolioList, setPortfolioList] = useState<PortfolioListItem[]>([]);
  const portfolioService = useMemo(() => new PortfolioService(), []);
  const fetchMasterPortfolio = useCallback(
    async (userId: string, userEmail: string) => {
      setLoading(true);
      setError(null);
      try {
        const rawData = await portfolioService.getMasterPortfolioData(userId, userEmail);
        if (!rawData) {
          throw new Error("Failed to load master data");
        }
        const formattedData = portfolioService.convertToPortfolioData(rawData);

        setPortfolioData(formattedData);
      } catch (err: any) {
        console.error("fetchMasterPortfolio error:", err);
        setError(err.message || "Failed to load master data");
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  const createPortfolio = useCallback(
    async (userId: string, name: string, description: string, items: Array<{ sourceType: "SFIA" | "TPQI"; externalId: string }>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await portfolioService.createPortfolio({
          userId,
          name,
          description,
          items,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        return result;
      } catch (err: any) {
        console.error("createPortfolio error:", err);
        setError(err.message || "Failed to create portfolio");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  const fetchUserPortfolios = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const list = await portfolioService.getUserPortfolios(userId);
        setPortfolioList(list);
      } catch (err: any) {
        setError(err.message || "Failed to load portfolios");
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  const fetchPortfolioById = useCallback(
    async (portfolioId: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await portfolioService.getPortfolioById(portfolioId);
        if (!data) {
          throw new Error("Portfolio not found");
        }
        setPortfolioData(data);

        return data;
      } catch (err: any) {
        setError(err.message || "Failed to load portfolio details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  const updatePortfolio = useCallback(
    async (id: string, name: string, description: string, items: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await portfolioService.updatePortfolio(id, {
          name,
          description,
          items,
        });

        return result;
      } catch (err: any) {
        console.error("Update error:", err);
        setError(err.response?.data?.message || "แก้ไขไม่สำเร็จ");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  const deletePortfolio = useCallback(
    async (portfolioId: string) => {
      setLoading(true);
      try {
        const success = await portfolioService.deletePortfolio(portfolioId);
        if (success) {
          setPortfolioList((prev) => prev.filter((p) => p.id !== portfolioId));
        } else {
          throw new Error("Failed to delete");
        }
        return success;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [portfolioService]
  );

  return {
    // State
    loading,
    error,
    portfolioData,
    portfolioList,

    // Actions
    fetchMasterPortfolio,
    createPortfolio,
    fetchUserPortfolios,
    fetchPortfolioById,
    deletePortfolio,
    clearError: () => setError(null),
    updatePortfolio,
    // Utilities
    generateRecommendations: portfolioService.generateRecommendations,
  };
};
