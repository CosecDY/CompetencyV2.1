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
        nextUrls[id] = { evidenceUrl: v.url ?? "", approvalStatus: v.approvalStatus ?? null };
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
      urls: { ...prev.urls, [idStr]: { evidenceUrl: "", approvalStatus: null } },
      submitted: { ...prev.submitted, [idStr]: false },
      errors: { ...prev.errors, [idStr]: "" },
      approvalStatus: { ...prev.approvalStatus, [idStr]: null },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (id: number): Promise<void> => {
      const idStr = id.toString();

      // read current value from state (functional read to avoid stale)
      let currentValue = "";
      setEvidenceState((prev) => {
        currentValue = prev.urls[idStr]?.evidenceUrl?.trim() ?? "";
        return prev;
      });

      if (!currentValue) {
        setEvidenceState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [idStr]: "Evidence URL or description cannot be empty." },
        }));
        return;
      }

      // start loading
      setEvidenceState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [idStr]: true },
        errors: { ...prev.errors, [idStr]: "" },
      }));

      try {
        const isUrl = evidenceService.isValidUrl(currentValue);
        const request: SubmitEvidenceRequest = {
          subSkillId: id,
          evidenceText: currentValue,
          ...(isUrl ? { evidenceUrl: currentValue } : {}),
        } as SubmitEvidenceRequest;

        const response = await evidenceService.submitEvidence(request);

        if (response.success) {
          setEvidenceState((prev) => ({
            ...prev,
            submitted: { ...prev.submitted, [idStr]: true },
            approvalStatus: { ...prev.approvalStatus, [idStr]: "NOT_APPROVED" },
            urls: {
              ...prev.urls,
              [idStr]: { evidenceUrl: currentValue, approvalStatus: "NOT_APPROVED" },
            },
            errors: { ...prev.errors, [idStr]: "" },
          }));
        } else {
          setEvidenceState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [idStr]: response.message || "Failed to submit evidence." },
          }));
        }
      } catch (err: unknown) {
        let msg = "Failed to submit evidence. Please try again.";
        if (err instanceof Error) msg = err.message;
        else if ((err as AxiosError).isAxiosError) {
          const a = err as AxiosError;
          msg = (a.response?.data as any)?.message ?? a.message ?? msg;
        }

        setEvidenceState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [idStr]: msg },
        }));
        console.error(`[SfiaEvidence] submit error subSkill=${id} :`, err);
      } finally {
        setEvidenceState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [idStr]: false },
        }));
      }
    },
    [evidenceService]
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
            urls: { ...prev.urls, [idStr]: { evidenceUrl: "", approvalStatus: null } },
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
          msg = (a.response?.data as any)?.message ?? a.message ?? msg;
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

  return {
    evidenceState,
    initializeEvidenceUrls,
    handleUrlChange,
    handleRemove,
    handleSubmit,
    handleDelete,
  };
};
