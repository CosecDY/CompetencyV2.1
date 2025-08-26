import { useState, useEffect, useCallback } from "react";
import { GetSfiaEvidenceService } from "../../services/getSfiaEvidenceAPI";

interface EvidenceData {
  [subSkillId: number]: {
    url: string;
    approvalStatus?: string;
  };
}

export function useEvidenceFetcher(skillCode: string) {
  const [evidenceData, setEvidenceData] = useState<EvidenceData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    if (!skillCode) return;

    setLoading(true);
    setError(null);

    try {
      const evidenceService = new GetSfiaEvidenceService();

      const response = await evidenceService.getEvidence({
        skillCode,
      });

      if (response.success && response.data) {
        setEvidenceData(response.data);
      } else {
        setEvidenceData(null);
        setError(response.message || "No evidence found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch evidence");
      console.error("Evidence fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [skillCode]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  return {
    evidenceData,
    loading,
    error,
    refetch: fetchEvidence,
  };
}
