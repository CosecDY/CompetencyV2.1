import React, { useEffect, useState, useCallback } from "react";
import { EvidenceItem } from "../shared/EvidenceItem";
import { SfiaSubSkill } from "../../types/sfia";
import { GetSfiaEvidenceService } from "../../services/getSfiaEvidenceAPI";

interface SubSkillItemProps {
  /** Sub-skill information including description text. */
  subskill: SfiaSubSkill;
  /** Unique identifier for the sub-skill, used for tracking evidence submission. */
  skillCode: string;
  /** Current URL or description entered for this sub-skill. */
  url: string;
  /** Approval status of the evidence */
  approvalStatus?: string | null;
  /** Indicates whether the evidence has been successfully submitted. */
  submitted: boolean;
  /** Indicates whether the submission process is currently in progress. */
  loading: boolean;
  /** Indicates whether the deletion process is currently in progress. */
  deleting?: boolean;
  /** Error message related to the evidence submission (if unknown). */
  error: string;
  /** Callback to handle URL/description input changes. */
  onUrlChange: (value: string) => void;
  /** Callback to handle removal/reset of the evidence input. */
  onRemove: () => void;
  /** Callback to trigger evidence submission. */
  onSubmit: () => void;
  /** Callback to trigger evidence deletion from server. */
  onDelete?: () => void;
  /** Optional callback for when evidence is successfully loaded. */
  onEvidenceLoaded?: (evidence: string) => void;
}

// Custom hook for evidence fetching
const useEvidenceFetcher = (skillCode: string, subskillId: number, onUrlChange: (value: string) => void, onEvidenceLoaded?: (evidence: string) => void) => {
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceLoaded, setEvidenceLoaded] = useState(false);

  const fetchExistingEvidence = useCallback(async () => {
    if (!skillCode || evidenceLoaded) return;

    setEvidenceLoading(true);
    try {
      const evidenceService = new GetSfiaEvidenceService();

      const response = await evidenceService.getEvidence({
        skillCode,
      });

      if (response.success && response.data) {
        type EvidenceItem = { id: number; evidenceUrl?: string | null };
        const evidences: EvidenceItem[] = Array.isArray(response.data.evidences)
          ? response.data.evidences.filter(
              (evidence: unknown): evidence is EvidenceItem =>
                typeof evidence === "object" && evidence !== null && !Array.isArray(evidence) && "id" in evidence && typeof (evidence as EvidenceItem).id === "number"
            )
          : [];

        const subSkillEvidence = evidences.find((evidence) => evidence.id === subskillId);

        const url = subSkillEvidence?.evidenceUrl ?? undefined;
        if (url) {
          onEvidenceLoaded?.(url);
          onUrlChange(url);
        }
      }
      setEvidenceLoaded(true);
    } catch (error) {
      console.error("Failed to fetch existing evidence:", error);
      setEvidenceLoaded(true);
    } finally {
      setEvidenceLoading(false);
    }
  }, [skillCode, subskillId, evidenceLoaded, onEvidenceLoaded, onUrlChange]);

  useEffect(() => {
    fetchExistingEvidence();
  }, [fetchExistingEvidence]);

  return { evidenceLoading, evidenceLoaded };
};

/**
 * SubSkillItem Component
 *
 * Displays an individual SFIA sub-skill with evidence submission functionality.
 * Optimized for performance with proper state management.
 */
const SubSkillItem: React.FC<SubSkillItemProps> = ({
  subskill,
  skillCode,
  url,
  approvalStatus,
  submitted,
  loading,
  deleting = false,
  error,
  onUrlChange,
  onRemove,
  onSubmit,
  onDelete,
  onEvidenceLoaded,
}) => {
  // Custom hook for evidence fetching
  const { evidenceLoading } = useEvidenceFetcher(skillCode, subskill.id, onUrlChange, onEvidenceLoaded);

  // Debug wrapper for onDelete
  const handleDeleteDebug = () => {
    console.log("SubSkillItem: onDelete called for subskill", subskill.id);
    if (onDelete) {
      console.log("SubSkillItem: Calling parent onDelete...");
      onDelete();
    } else {
      console.log("SubSkillItem: onDelete function is undefined!");
    }
  };

  return (
    <EvidenceItem
      id={`subskill-${subskill.id}`}
      text={subskill.subskill_text ?? ""}
      url={url}
      approvalStatus={approvalStatus}
      submitted={submitted}
      loading={loading}
      deleting={deleting}
      error={error}
      evidenceLoading={evidenceLoading}
      colorVariant="blue"
      placeholder="Enter evidence URL"
      subSkillId={subskill.id}
      onRemove={onRemove}
      onSubmit={onSubmit}
      onDelete={handleDeleteDebug}
      onUrlChange={onUrlChange}
    />
  );
};

export default SubSkillItem;
