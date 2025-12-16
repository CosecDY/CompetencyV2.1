import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaCertificate,
} from "react-icons/fa";
import { EvidenceStatus, getStatusConfig } from "./evidenceStatusUtils";

export type ColorVariant = "blue" | "purple" | "green";

interface StatusIconProps {
  status: EvidenceStatus;
  colorVariant?: ColorVariant;
}

interface StatusBadgeProps {
  status: EvidenceStatus;
  colorVariant?: ColorVariant;
}

interface StatusMessagesProps {
  status: EvidenceStatus;
  error?: string;
  colorVariant?: ColorVariant;
}

// Color configuration for different variants
const getColorClasses = (colorVariant: ColorVariant = "blue") => {
  switch (colorVariant) {
    case "blue":
      return {
        primary: "text-blue-500",
        primaryBg: "bg-blue-100",
        primaryText: "text-blue-700",
        border: "border-blue-300",
        ready: "text-blue-600",
      };
    case "purple":
      return {
        primary: "text-purple-500",
        primaryBg: "bg-purple-100",
        primaryText: "text-purple-700",
        border: "border-purple-300",
        ready: "text-purple-600",
      };
    case "green":
      return {
        primary: "text-green-500",
        primaryBg: "bg-green-100",
        primaryText: "text-green-700",
        border: "border-green-300",
        ready: "text-green-600",
      };
  }
};

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  colorVariant = "blue",
}) => {
  const colors = getColorClasses(colorVariant);

  switch (status) {
    case EvidenceStatus.LOADING:
      return (
        <FaSpinner
          className={`w-5 h-5 ${colors.primary} animate-spin flex-shrink-0`}
        />
      );
    case EvidenceStatus.DELETING:
      return (
        <FaSpinner className="w-5 h-5 text-red-500 animate-spin flex-shrink-0" />
      );
    case EvidenceStatus.ERROR:
      return (
        <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
      );
    case EvidenceStatus.APPROVED:
      return <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
    case EvidenceStatus.REJECTED:
      return <FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    case EvidenceStatus.PENDING:
      return <FaClock className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    case EvidenceStatus.READY_TO_SUBMIT:
      return (
        <div
          className={`w-5 h-5 border-2 ${colors.border} rounded-full flex-shrink-0`}
        />
      );
    case EvidenceStatus.NOT_STARTED:
    default:
      return (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
      );
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colorVariant = "blue",
}) => {
  const colors = getColorClasses(colorVariant);
  const config = getStatusConfig(status);

  switch (status) {
    case EvidenceStatus.LOADING:
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colors.primaryBg} ${colors.primaryText}`}
        >
          {config.badgeText}
        </span>
      );
    case EvidenceStatus.DELETING:
    case EvidenceStatus.ERROR:
    case EvidenceStatus.REJECTED:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          {config.badgeText}
        </span>
      );
    case EvidenceStatus.APPROVED:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {config.badgeText}
        </span>
      );
    case EvidenceStatus.PENDING:
    case EvidenceStatus.READY_TO_SUBMIT:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          {config.badgeText}
        </span>
      );
    case EvidenceStatus.NOT_STARTED:
    default:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          {config.badgeText}
        </span>
      );
  }
};

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  status,
  error,
  colorVariant = "blue",
}) => {
  const colors = getColorClasses(colorVariant);
  const config = getStatusConfig(status);

  return (
    <div className="mt-2 space-y-1">
      {/* Loading state */}
      {status === EvidenceStatus.LOADING && (
        <div
          className={`flex items-center gap-2 ${colors.ready} text-sm`}
          aria-live="polite"
        >
          <FaSpinner className="w-3 h-3 animate-spin" />
          <span>{config.message}</span>
        </div>
      )}

      {/* Deleting state */}
      {status === EvidenceStatus.DELETING && (
        <div
          className="flex items-center gap-2 text-red-600 text-sm"
          aria-live="polite"
        >
          <FaSpinner className="w-3 h-3 animate-spin" />
          <span>{config.message}</span>
        </div>
      )}

      {/* Error state */}
      {status === EvidenceStatus.ERROR && error && (
        <div
          className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2"
          role="alert"
          aria-live="assertive"
        >
          <FaExclamationTriangle className="w-3 h-3" />
          <span>{error}</span>
          {/*<span>Sorry, an error occurred.</span>*/}
        </div>
      )}

      {/* Status-specific messages */}
      {status !== EvidenceStatus.LOADING &&
        status !== EvidenceStatus.DELETING &&
        status !== EvidenceStatus.ERROR && (
          <>
            {status === EvidenceStatus.APPROVED && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded p-2">
                <FaCheckCircle className="w-3 h-3" />
                <span>{config.message}</span>
              </div>
            )}
            {status === EvidenceStatus.REJECTED && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                <FaTimesCircle className="w-3 h-3" />
                <span>{config.message}</span>
              </div>
            )}
            {status === EvidenceStatus.PENDING && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                <FaClock className="w-3 h-3" />
                <span>{config.message}</span>
              </div>
            )}
            {status === EvidenceStatus.READY_TO_SUBMIT && (
              <div
                className={`flex items-center gap-2 ${colors.ready} text-sm`}
              >
                <FaCheckCircle className="w-3 h-3" />
                <span>{config.message}</span>
              </div>
            )}
            {status === EvidenceStatus.NOT_STARTED && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FaCertificate className="w-3 h-3" />
                <span>{config.message}</span>
              </div>
            )}
          </>
        )}
    </div>
  );
};
