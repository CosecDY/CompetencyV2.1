import { useState, useEffect, useCallback } from "react";

import { fetchTpqiEvidenceByUnitCode, TpqiEvidenceData } from "../../services/tpqiEvidenceAPI";

interface UseTpqiEvidenceFetcherResult {
  evidenceData: TpqiEvidenceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching existing TPQI evidence data
 */
export const useTpqiEvidenceFetcher = (unitCode: string): UseTpqiEvidenceFetcherResult => {
  const [evidenceData, setEvidenceData] = useState<TpqiEvidenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    if (!unitCode || unitCode.trim() === "") {
      setEvidenceData({ skills: {}, knowledge: {} });
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTpqiEvidenceByUnitCode(unitCode);
      setEvidenceData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch evidence";
      setError(message);
      // set empty normalized data to avoid null checks in UI
      setEvidenceData({ skills: {}, knowledge: {} });
      console.error("useTpqiEvidenceFetcher:", err);
    } finally {
      setLoading(false);
    }
  }, [unitCode]);

  useEffect(() => {
    void fetchEvidence();
  }, [fetchEvidence]);

  return {
    evidenceData,
    loading,
    error,
    refetch: fetchEvidence,
  };
};
