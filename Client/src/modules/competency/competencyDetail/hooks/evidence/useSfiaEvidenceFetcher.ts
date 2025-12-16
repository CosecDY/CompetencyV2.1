import { useState, useEffect, useCallback } from "react";
import { GetSfiaEvidenceService } from "../../services/getSfiaEvidenceAPI";

interface EvidenceMap {
  [subSkillId: number]: {
    url: string;
    approvalStatus?: string | null;
  };
}

export function useEvidenceFetcher(skillCode: string) {
  const [evidenceData, setEvidenceData] = useState<EvidenceMap>({});
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
        type EvidenceItem = {
          id: number;
          evidenceUrl?: string | null;
          approvalStatus?: string | null;
        };
        // response.data.evidences is an array of { id, evidenceUrl, approvalStatus }
        const transformed: EvidenceMap = (response.data.evidences || []).reduce(
          (acc: EvidenceMap, item: EvidenceItem) => {
            if (
              item &&
              typeof item === "object" &&
              typeof item.id === "number"
            ) {
              const id = item.id;
              const url =
                typeof item.evidenceUrl === "string" ? item.evidenceUrl : "";
              const approvalStatus =
                typeof item.approvalStatus === "string"
                  ? item.approvalStatus
                  : null;
              // If multiple records exist per subskill, keep the first non-empty URL
              if (!acc[id] || (url && !acc[id].url)) {
                acc[id] = { url, approvalStatus };
              }
            }
            return acc;
          },
          {} as EvidenceMap
        );
        setEvidenceData(transformed);
      } else {
        setEvidenceData({});
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
