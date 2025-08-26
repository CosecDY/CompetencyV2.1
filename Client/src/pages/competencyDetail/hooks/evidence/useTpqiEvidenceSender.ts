import { useState, useMemo, useCallback } from "react";
import { TpqiEvidenceService } from "../../services/postTpqiEvidenceAPI";
import { DeleteTpqiEvidenceService } from "../../services/deleteTpqiEvidenceAPI";
import { SubmitTpqiEvidenceRequest, TpqiApiResponse as ApiResponse } from "../../types/tpqi";
/**
 * Interface for TPQI evidence state management
 */
export interface TpqiEvidenceState {
  urls: { [id: string]: string }; // Evidence URLs for each skill/knowledge ID
  submitted: { [id: string]: boolean }; // Submission status
  loading: { [id: string]: boolean }; // Loading states for submission
  deleting: { [id: string]: boolean }; // Loading states for deletion
  errors: { [id: string]: string }; // Error messages
  approvalStatus: { [id: string]: string }; // Approval status
}

/**
 * Interface for evidence type (skill or knowledge)
 */
export interface EvidenceType {
  type: "skill" | "knowledge";
  id: number;
}

/**
 * # TPQI Evidence Management Hook
 *
 * A React hook that manages evidence submission for TPQI (Thai Professional Qualification Institute)
 * competency assessments. This hook provides a complete solution for handling multiple evidence
 * submissions with individual state tracking per skill or knowledge item.
 *
 * ## State Management
 * Each skill/knowledge ID has its own independent state:
 * ```
 * evidenceState: {
 *   urls: { "skill-123": "https://example.com", "knowledge-456": "https://example.com" }
 *   submitted: { "skill-123": true, "knowledge-456": false }
 *   loading: { "skill-123": false, "knowledge-456": true }
 *   errors: { "skill-123": "", "knowledge-456": "Please enter evidence URL" }
 *   approvalStatus: { "skill-123": "APPROVED", "knowledge-456": "NOT_APPROVED" }
 * }
 * ```
 *
 * ## Quick Usage
 * ```jsx
 * function TpqiEvidenceForm({ skillId, knowledgeId }) {
 *   const { evidenceState, handleUrlChange, handleSubmit } = useTpqiEvidenceSender();
 *   const evidenceKey = skillId ? `skill-${skillId}` : `knowledge-${knowledgeId}`;
 *
 *   return (
 *     <div>
 *       <input
 *         value={evidenceState.urls[evidenceKey] || ''}
 *         onChange={(e) => handleUrlChange(
 *           { type: skillId ? 'skill' : 'knowledge', id: skillId || knowledgeId },
 *           e.target.value
 *         )}
 *         placeholder="Enter evidence URL"
 *       />
 *       <button onClick={() => handleSubmit({ type: skillId ? 'skill' : 'knowledge', id: skillId || knowledgeId })}>
 *         {evidenceState.loading[evidenceKey] ? 'Submitting...' : 'Submit'}
 *       </button>
 *       {evidenceState.errors[evidenceKey] && (
 *         <p className="error">{evidenceState.errors[evidenceKey]}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {Object} Hook interface
 * @returns {TpqiEvidenceState} evidenceState - Complete state object for all skills/knowledge
 * @returns {Function} handleUrlChange - Updates evidence input: `(evidence: EvidenceType, value: string) => void`
 * @returns {Function} handleRemove - Clears evidence data: `(evidence: EvidenceType) => void`
 * @returns {Function} handleSubmit - Submits evidence: `(evidence: EvidenceType) => Promise<void>`
 * @returns {Function} initializeEvidenceUrls - Initialize with existing evidence data
 */
export const useTpqiEvidenceSender = () => {
  // Initialize state for tracking all evidence submissions
  const [evidenceState, setEvidenceState] = useState<TpqiEvidenceState>({
    urls: {}, // Evidence input values (URLs)
    submitted: {}, // Submission completion status
    loading: {}, // API call loading states for submission
    deleting: {}, // API call loading states for deletion
    errors: {}, // Validation and submission errors
    approvalStatus: {}, // Approval status for each skill/knowledge
  });

  /**
   * Initialize evidence URLs from existing data
   */
  const initializeEvidenceUrls = useCallback(
    (evidenceData: {
      skills?: {
        [skillId: number]: {
          evidenceUrl: string;
          approvalStatus: string | null;
        };
      };
      knowledge?: {
        [knowledgeId: number]: {
          evidenceUrl: string;
          approvalStatus: string | null;
        };
      };
    }) => {
      setEvidenceState((prev) => {
        const newUrls = { ...prev.urls };
        const newSubmitted = { ...prev.submitted };
        const newApprovalStatus = { ...prev.approvalStatus };

        // Initialize skills
        if (evidenceData.skills) {
          Object.entries(evidenceData.skills).forEach(([skillId, data]) => {
            const key = `skill-${skillId}`;
            newUrls[key] = data.evidenceUrl || "";
            newSubmitted[key] = !!data.evidenceUrl;
            newApprovalStatus[key] = data.approvalStatus || "NOT_APPROVED";
          });
        }

        // Initialize knowledge
        if (evidenceData.knowledge) {
          Object.entries(evidenceData.knowledge).forEach(([knowledgeId, data]) => {
            const key = `knowledge-${knowledgeId}`;
            newUrls[key] = data.evidenceUrl || "";
            newSubmitted[key] = !!data.evidenceUrl;
            newApprovalStatus[key] = data.approvalStatus || "NOT_APPROVED";
          });
        }

        return {
          ...prev,
          urls: newUrls,
          submitted: newSubmitted,
          approvalStatus: newApprovalStatus,
        };
      });
    },
    []
  );

  /**
   * Service instances for API calls - memoized to prevent unnecessary re-creation
   */
  const evidenceService = useMemo(() => new TpqiEvidenceService(), []);

  const deleteService = useMemo(() => new DeleteTpqiEvidenceService(), []);

  /**
   * Generate a unique key for evidence tracking
   */
  const getEvidenceKey = (evidence: EvidenceType): string => {
    return `${evidence.type}-${evidence.id}`;
  };

  /**
   * Updates the evidence input for a specific skill or knowledge item
   *
   * @param {EvidenceType} evidence - The evidence type and ID to update
   * @param {string} value - The evidence URL
   *
   * Side effects:
   * - Updates the input value in state
   * - Clears any existing error for this evidence
   */
  const handleUrlChange = (evidence: EvidenceType, value: string) => {
    const key = getEvidenceKey(evidence);
    setEvidenceState((prev) => ({
      ...prev,
      urls: { ...prev.urls, [key]: value },
      errors: { ...prev.errors, [key]: "" }, // Clear errors on input change
    }));
  };

  /**
   * Completely resets the evidence entry for a skill or knowledge item
   *
   * @param {EvidenceType} evidence - The evidence type and ID to reset
   *
   * Side effects:
   * - Clears the evidence input
   * - Resets submission status to false
   * - Clears any errors
   */
  const handleRemove = (evidence: EvidenceType) => {
    const key = getEvidenceKey(evidence);
    setEvidenceState((prev) => ({
      ...prev,
      urls: { ...prev.urls, [key]: "" },
      submitted: { ...prev.submitted, [key]: false },
      errors: { ...prev.errors, [key]: "" },
      approvalStatus: { ...prev.approvalStatus, [key]: "" },
    }));
  };

  /**
   * Validates and submits evidence for a specific skill or knowledge item
   *
   * @param {EvidenceType} evidence - The evidence type and ID to submit evidence for
   *
   * Process:
   * 1. Validates evidence input (must be a valid URL)
   * 2. Checks user authentication
   * 3. Sets loading state
   * 4. Calls API to submit evidence
   * 5. Updates state based on success/failure
   * 6. Always clears loading state
   */
  const handleSubmit = async (evidence: EvidenceType) => {
    const key = getEvidenceKey(evidence);

    // Clear old status for this evidence before starting submission
    setEvidenceState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [key]: "" },
      submitted: { ...prev.submitted, [key]: false },
      loading: { ...prev.loading, [key]: false },
    }));

    const evidenceUrl = evidenceState.urls[key];

    // Step 1: Validate evidence input
    if (!evidenceUrl || evidenceUrl.trim() === "") {
      setEvidenceState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: "Evidence URL cannot be empty." },
      }));
      return;
    }

    // Basic URL validation
    const urlValidation = evidenceService.validateEvidenceUrl(evidenceUrl);
    if (!urlValidation.isValid) {
      setEvidenceState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [key]: urlValidation.error || "Invalid URL format.",
        },
      }));
      return;
    }

    // Step 3: Set loading state and clear errors
    setEvidenceState((prev) => ({
      ...prev,
      loading: { ...prev.loading, [key]: true },
      errors: { ...prev.errors, [key]: "" },
    }));

    try {
      // Step 4: Prepare API request
      const evidenceRequest: SubmitTpqiEvidenceRequest = {
        evidenceUrl: evidenceUrl.trim(),
      };

      // Add skillId or knowledgeId based on evidence type
      if (evidence.type === "skill") {
        evidenceRequest.skillId = evidence.id;
      } else {
        evidenceRequest.knowledgeId = evidence.id;
      }

      // Step 5: Submit to API
      const response: ApiResponse = await evidenceService.submitEvidence(evidenceRequest);

      if (response.success) {
        // Success: Mark as submitted
        setEvidenceState((prev) => ({
          ...prev,
          submitted: { ...prev.submitted, [key]: true },
          approvalStatus: {
            ...prev.approvalStatus,
            [key]: response.data?.approvalStatus || "NOT_APPROVED",
          },
        }));
      } else {
        // API returned error
        setEvidenceState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [key]: response.message || "Failed to submit evidence.",
          },
        }));
      }
    } catch (error: unknown) {
      // Network or other errors
      console.error("Error submitting TPQI evidence:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit evidence. Please try again.";

      setEvidenceState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [key]: errorMessage,
        },
      }));
    } finally {
      // Step 6: Always clear loading state
      setEvidenceState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [key]: false },
      }));
    }
  };

  /**
   * Get evidence state for a specific skill or knowledge item
   */
  const getEvidenceState = (evidence: EvidenceType) => {
    const key = getEvidenceKey(evidence);
    return {
      url: evidenceState.urls[key] || "",
      submitted: evidenceState.submitted[key] || false,
      loading: evidenceState.loading[key] || false,
      error: evidenceState.errors[key] || "",
      approvalStatus: evidenceState.approvalStatus[key] || "",
    };
  };

  /**
   * Check if evidence can be submitted (has URL and not currently loading)
   */
  const canSubmitEvidence = (evidence: EvidenceType): boolean => {
    const key = getEvidenceKey(evidence);
    const url = evidenceState.urls[key];
    const loading = evidenceState.loading[key];

    return !!(url?.trim() && !loading);
  };

  /**
   * Deletes evidence for a specific skill or knowledge item
   *
   * @param {EvidenceType} evidence - The evidence object containing type and ID
   * @returns {Promise<boolean>} Promise that resolves to true if deletion was successful
   */
  const handleDelete = async (evidence: EvidenceType): Promise<boolean> => {
    const key = getEvidenceKey(evidence);

    // Validate evidence
    if (!evidence.type || (evidence.type !== "knowledge" && evidence.type !== "skill")) {
      setEvidenceState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: "Invalid evidence type" },
      }));
      return false;
    }

    if (!evidence.id || evidence.id <= 0) {
      setEvidenceState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: `Invalid ${evidence.type} ID` },
      }));
      return false;
    }

    try {
      // Set deleting state
      setEvidenceState((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [key]: true },
        errors: { ...prev.errors, [key]: "" },
      }));

      console.log(`🔥 Deleting ${evidence.type} evidence for ID: ${evidence.id}`);

      // Make API call
      const result = await deleteService.deleteEvidence({
        evidenceType: evidence.type,
        evidenceId: evidence.id,
      });

      if (result.success) {
        console.log(`✅ ${evidence.type} evidence deleted successfully:`, result.data);

        // Clear evidence from state after successful deletion
        setEvidenceState((prev) => ({
          ...prev,
          urls: { ...prev.urls, [key]: "" },
          submitted: { ...prev.submitted, [key]: false },
          approvalStatus: { ...prev.approvalStatus, [key]: "" },
          errors: { ...prev.errors, [key]: "" },
        }));

        return true;
      } else {
        const errorMessage = result.message || `Failed to delete ${evidence.type} evidence`;
        console.error(`❌ ${evidence.type} evidence deletion failed:`, errorMessage);
        setEvidenceState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [key]: errorMessage },
        }));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error(`❌ Error deleting ${evidence.type} evidence:`, error);
      setEvidenceState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: errorMessage },
      }));
      return false;
    } finally {
      setEvidenceState((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [key]: false },
      }));
    }
  };

  /**
   * Helper function to check if evidence is currently being deleted
   */
  const isDeleting = (evidence: EvidenceType): boolean => {
    const key = getEvidenceKey(evidence);
    return evidenceState.deleting[key] || false;
  };

  return {
    evidenceState,
    handleUrlChange,
    handleRemove,
    handleSubmit,
    handleDelete,
    initializeEvidenceUrls,
    getEvidenceState,
    canSubmitEvidence,
    getEvidenceKey,
    isDeleting,
  };
};
