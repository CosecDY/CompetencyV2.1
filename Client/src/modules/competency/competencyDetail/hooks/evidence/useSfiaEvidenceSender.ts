import { useState, useMemo, useCallback } from "react";
import { SfiaEvidenceService } from "../../services/postSfiaEvidenceAPI";
import { DeleteSfiaEvidenceService } from "../../services/deleteSfiaEvidenceAPI";
import { SubmitEvidenceRequest, EvidenceState } from "../../types/sfia";
import { AxiosError } from "axios";

/**
 * useSfiaEvidenceSender
 * - Keeps evidenceState shape consistent with EvidenceState type:
 *   urls: { [id]: { evidenceUrl: string; approvalStatus: string | null } }
 */
export const useSfiaEvidenceSender = () => {
  const [evidenceState, setEvidenceState] = useState<EvidenceState>({
    urls: {}, // { [subSkillId]: { evidenceUrl, approvalStatus } }
    submitted: {}, // { [subSkillId]: boolean }
    loading: {}, // { [subSkillId]: boolean }
    deleting: {}, // { [subSkillId]: boolean }
    errors: {}, // { [subSkillId]: string }
    approvalStatus: {}, // { [subSkillId]: string | null }
  });

  // memoized services
  const evidenceService = useMemo(() => new SfiaEvidenceService(), []);
  const deleteService = useMemo(() => new DeleteSfiaEvidenceService(), []);

  /**
   * Initialize urls from external data
   * input shape: { [subSkillId]: { url: string, approvalStatus: string | null } }
   */
  const initializeEvidenceUrls = useCallback((data: { [subSkillId: number]: { url: string; approvalStatus: string | null } }) => {
    setEvidenceState((prev) => {
      const nextUrls = { ...prev.urls };
      const nextSubmitted = { ...prev.submitted };
      const nextApproval = { ...prev.approvalStatus };

      Object.entries(data).forEach(([k, v]) => {
        const id = k.toString();
        nextUrls[id] = {
          evidenceUrl: v.url ?? "",
          approvalStatus: v.approvalStatus ?? null,
        };
        nextSubmitted[id] = !!v.url;
        nextApproval[id] = v.approvalStatus ?? null;
      });

      return {
        ...prev,
        urls: nextUrls,
        submitted: nextSubmitted,
        approvalStatus: nextApproval,
      };
    });
  }, []);

  const handleUrlChange = useCallback((id: number, value: string) => {
    const idStr = id.toString();
    setEvidenceState((prev) => ({
      ...prev,
      urls: {
        ...prev.urls,
        [idStr]: {
          evidenceUrl: value,
          approvalStatus: prev.urls[idStr]?.approvalStatus ?? null,
        },
      },
      errors: { ...prev.errors, [idStr]: "" }, // clear error on change
    }));
  }, []);

  const handleRemove = useCallback((id: number) => {
    const idStr = id.toString();
    setEvidenceState((prev) => ({
      ...prev,
      urls: {
        ...prev.urls,
        [idStr]: { evidenceUrl: "", approvalStatus: null },
      },
      submitted: { ...prev.submitted, [idStr]: false },
      errors: { ...prev.errors, [idStr]: "" },
      approvalStatus: { ...prev.approvalStatus, [idStr]: null },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (id: number): Promise<void> => {
      const idStr = id.toString();

      // Read the latest URL safely from current state
      const evidenceUrl = evidenceState.urls[idStr]?.evidenceUrl || "";

      // Step 0: Clear previous error and set loading
      setEvidenceState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [idStr]: true },
        errors: { ...prev.errors, [idStr]: "" },
        submitted: { ...prev.submitted, [idStr]: false },
      }));

      // Step 1: Validate input
      if (!evidenceUrl.trim()) {
        setEvidenceState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [idStr]: "Evidence URL cannot be empty.",
          },
          loading: { ...prev.loading, [idStr]: false },
        }));
        return;
      }

      // Step 2: Validate URL format
      const urlValidation = evidenceService.validateEvidenceUrl(evidenceUrl);
      if (!urlValidation.isValid) {
        setEvidenceState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [idStr]: urlValidation.error || "Invalid URL format.",
          },
          loading: { ...prev.loading, [idStr]: false },
        }));
        return;
      }

      try {
        // Create request with only evidenceUrl
        const request: SubmitEvidenceRequest = {
          subSkillId: id,
          evidenceText: "Default evidence text", // Replace with appropriate value
          evidenceUrl: evidenceUrl.trim(),
        };

        const response = await evidenceService.submitEvidence(request);

        setEvidenceState((prev) => {
          if (response.success) {
            return {
              ...prev,
              submitted: { ...prev.submitted, [idStr]: true },
              approvalStatus: {
                ...prev.approvalStatus,
                [idStr]: "PENDING",
              },
              urls: {
                ...prev.urls,
                [idStr]: {
                  evidenceUrl: evidenceUrl.trim(),
                  approvalStatus: "PENDING",
                },
              },
              errors: { ...prev.errors, [idStr]: "" },
            };
          } else {
            return {
              ...prev,
              errors: {
                ...prev.errors,
                [idStr]: response.message || "Failed to submit evidence.",
              },
            };
          }
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit evidence. Please try again.";

        setEvidenceState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [idStr]: errorMessage },
        }));

        console.error(`[SfiaEvidence] submit error subSkill=${id}:`, error);
      } finally {
        setEvidenceState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [idStr]: false },
        }));
      }
    },
    [evidenceService, evidenceState.urls]
  );

  const handleDelete = useCallback(
    async (id: number): Promise<boolean> => {
      const idStr = id.toString();

      setEvidenceState((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [idStr]: true },
        errors: { ...prev.errors, [idStr]: "" },
      }));

      try {
        const result = await deleteService.deleteEvidence({ subSkillId: id });
        if (result.success) {
          setEvidenceState((prev) => ({
            ...prev,
            urls: {
              ...prev.urls,
              [idStr]: { evidenceUrl: "", approvalStatus: null },
            },
            submitted: { ...prev.submitted, [idStr]: false },
            approvalStatus: { ...prev.approvalStatus, [idStr]: null },
            errors: { ...prev.errors, [idStr]: "" },
          }));
          return true;
        } else {
          const msg = result.message || "Failed to delete evidence.";
          setEvidenceState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [idStr]: msg },
          }));
          return false;
        }
      } catch (err: unknown) {
        let msg = "Failed to delete evidence. Please try again.";
        if (err instanceof Error) msg = err.message;
        else if ((err as AxiosError).isAxiosError) {
          const a = err as AxiosError;
          msg = (a.response?.data as { message?: string })?.message ?? a.message ?? msg;
        }

        setEvidenceState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [idStr]: msg },
        }));
        console.error(`[SfiaEvidence] delete error subSkill=${id} :`, err);
        return false;
      } finally {
        setEvidenceState((prev) => ({
          ...prev,
          deleting: { ...prev.deleting, [idStr]: false },
        }));
      }
    },
    [deleteService]
  );

  /**
   * Check if evidence can be submitted (has URL and not currently loading)
   */
  const canSubmitEvidence = useCallback(
    (id: number): boolean => {
      const idStr = id.toString();
      const url = evidenceState.urls[idStr]?.evidenceUrl;
      const loading = evidenceState.loading[idStr];

      return !!(url?.trim() && !loading);
    },
    [evidenceState.urls, evidenceState.loading]
  );

  /**
   * Get evidence state for a specific subskill
   */
  const getEvidenceState = useCallback(
    (id: number) => {
      const idStr = id.toString();
      return {
        url: evidenceState.urls[idStr]?.evidenceUrl || "",
        submitted: evidenceState.submitted[idStr] || false,
        loading: evidenceState.loading[idStr] || false,
        error: evidenceState.errors[idStr] || "",
        approvalStatus: evidenceState.approvalStatus[idStr] || null,
      };
    },
    [evidenceState]
  );

  return {
    evidenceState,
    initializeEvidenceUrls,
    handleUrlChange,
    handleRemove,
    handleSubmit,
    handleDelete,
    canSubmitEvidence,
    getEvidenceState,
  };
};
