// Types and Enums
export enum EvidenceStatus {
  LOADING = "loading",
  DELETING = "deleting",
  ERROR = "error",
  APPROVED = "approved",
  REJECTED = "rejected", 
  PENDING = "pending",
  READY_TO_SUBMIT = "ready-to-submit",
  NOT_STARTED = "not-started",
}

export enum ApprovalStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NOT_APPROVED = "NOT_APPROVED",
}

export interface StatusConfig {
  badgeText: string;
  message: string;
  badgeClass: string;
}

// Utility function to determine status
export const getEvidenceStatus = (
  evidenceLoading: boolean,
  loading: boolean,
  error: string,
  url: string,
  submitted: boolean,
  approvalStatus?: string | null,
  deleting?: boolean
): EvidenceStatus => {
  if (deleting) return EvidenceStatus.DELETING;
  if (evidenceLoading) return EvidenceStatus.LOADING;
  if (loading) return EvidenceStatus.LOADING;
  if (error) return EvidenceStatus.ERROR;

  if (submitted) {
    // Normalize approval status for comparison (case-insensitive)
    const normalizedStatus = approvalStatus?.toUpperCase?.() || '';
    
    switch (normalizedStatus) {
      case ApprovalStatus.APPROVED:
      case 'APPROVE':
      case 'ACCEPTED':
        return EvidenceStatus.APPROVED;
      case ApprovalStatus.REJECTED:
      case 'REJECT':
      case 'DECLINED':
        return EvidenceStatus.REJECTED;
      case ApprovalStatus.NOT_APPROVED:
      case 'PENDING':
      case 'WAITING':
      case '':
      case null:
      case undefined:
        return EvidenceStatus.PENDING;
      default:
        return EvidenceStatus.PENDING;
    }
  }

  const finalStatus = url ? EvidenceStatus.READY_TO_SUBMIT : EvidenceStatus.NOT_STARTED;
  return finalStatus;
};

// Status configuration mapping
export const STATUS_CONFIGS: Record<EvidenceStatus, StatusConfig> = {
  [EvidenceStatus.LOADING]: {
    badgeText: "Submitting...",
    message: "Submitting your evidence...",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  [EvidenceStatus.DELETING]: {
    badgeText: "Deleting...",
    message: "Removing your evidence...",
    badgeClass: "bg-red-100 text-red-700",
  },
  [EvidenceStatus.ERROR]: {
    badgeText: "Error",
    message: "An error occurred while submitting your evidence.",
    badgeClass: "bg-red-100 text-red-700",
  },
  [EvidenceStatus.APPROVED]: {
    badgeText: "Approved",
    message: "Your evidence has been approved!",
    badgeClass: "bg-green-100 text-green-700",
  },
  [EvidenceStatus.REJECTED]: {
    badgeText: "Rejected",
    message: "Your evidence was not approved. Please submit new evidence.",
    badgeClass: "bg-red-100 text-red-700",
  },
  [EvidenceStatus.PENDING]: {
    badgeText: "Pending Approval",
    message: "Your evidence is pending review by an administrator.",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  [EvidenceStatus.READY_TO_SUBMIT]: {
    badgeText: "Ready to Submit",
    message: "Ready to submit! Click the submit button when you're satisfied with your evidence.",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  [EvidenceStatus.NOT_STARTED]: {
    badgeText: "No Evidence",
    message: "Add a URL to online evidence demonstrating this skill/knowledge.",
    badgeClass: "bg-gray-100 text-gray-500",
  },
};

// Helper function to get status config
export const getStatusConfig = (status: EvidenceStatus): StatusConfig => {
  return STATUS_CONFIGS[status];
};
