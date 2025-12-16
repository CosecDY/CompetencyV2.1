import React, { useMemo } from "react";
import UrlInputBox from "./UrlInputBox";
import {
  StatusIcon,
  StatusBadge,
  StatusMessages,
} from "./EvidenceStatusComponents";
import { getEvidenceStatus } from "./evidenceStatusUtils";

interface EvidenceItemProps {
  /** Unique identifier for the evidence item */
  id: string;
  /** Display text for the evidence item */
  text: string;
  /** Current URL or description entered for this item */
  url: string;
  /** Approval status of the evidence */
  approvalStatus?: string | null;
  /** Indicates whether the evidence has been successfully submitted */
  submitted: boolean;
  /** Indicates whether the submission process is currently in progress */
  loading: boolean;
  /** Indicates whether the deletion process is currently in progress */
  deleting?: boolean;
  /** Error message related to the evidence submission (if any) */
  error: string;
  /** Indicates whether evidence is currently being loaded */
  evidenceLoading?: boolean;
  /** Color variant for styling (blue, purple, green) */
  colorVariant?: "blue" | "purple" | "green";
  /** Placeholder text for the input */
  placeholder?: string;
  /** SubSkill ID for deletion operations */
  subSkillId?: number;
  /** Callback to handle URL/description input changes */
  onUrlChange: (value: string) => void;
  /** Callback to handle removal/reset of the evidence input */
  onRemove: () => void;
  /** Callback to trigger evidence submission */
  onSubmit: () => void;
  /** Callback to trigger evidence deletion from server */
  onDelete?: () => void;
}

/**
 * EvidenceItem Component
 *
 * A reusable component for displaying evidence items with status management.
 * Used by both SFIA and TPQI components for consistent UI/UX.
 */
export const EvidenceItem: React.FC<EvidenceItemProps> = ({
  id,
  text,
  url,
  approvalStatus,
  submitted,
  loading,
  deleting = false,
  error,
  evidenceLoading = false,
  colorVariant = "blue",
  placeholder = "Enter evidence URL",
  onUrlChange,
  onRemove,
  onSubmit,
  onDelete,
}) => {
  // Memoized status calculation
  const status = useMemo(
    () =>
      getEvidenceStatus(
        evidenceLoading,
        loading,
        error,
        url,
        submitted,
        approvalStatus,
        deleting
      ),
    [evidenceLoading, loading, error, url, submitted, approvalStatus, deleting]
  );

  // Memoized input props
  const inputProps = useMemo(
    () => ({
      url,
      onChange: onUrlChange,
      onRemove,
      onSubmit,
      onDelete,
      placeholder,
      colorClass: {
        blue: "border-blue-300",
        purple: "border-purple-300",
        green: "border-green-300",
      }[colorVariant],
      disabled: evidenceLoading,
      readonly: submitted && !loading,
      loading,
      deleting,
    }),
    [
      url,
      onUrlChange,
      onRemove,
      onSubmit,
      onDelete,
      placeholder,
      colorVariant,
      evidenceLoading,
      submitted,
      loading,
      deleting,
    ]
  );

  return (
    <li className="flex flex-col gap-3" aria-labelledby={id}>
      {/* Evidence header with status indicator */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-1">
          <StatusIcon status={status} colorVariant={colorVariant} />

          {/* Evidence text */}
          <span id={id} className="text-gray-800 leading-relaxed">
            {text}
          </span>
        </div>

        <StatusBadge status={status} colorVariant={colorVariant} />
      </div>

      {/* Evidence input area */}
      <div className="ml-8 flex-1 min-w-0">
        <UrlInputBox {...inputProps} />

        <StatusMessages
          status={status}
          error={error}
          colorVariant={colorVariant}
        />
      </div>
    </li>
  );
};
