import React, { useState, useEffect } from "react";
import { FaCheck, FaTrash, FaPaperPlane, FaSpinner } from "react-icons/fa";

interface UrlInputBoxProps {
  url: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onSubmit: () => void;
  onDelete?: () => void; // Add onDelete prop for API call
  placeholder?: string;
  colorClass?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean; // Add loading prop for better UX
  deleting?: boolean; // Add deleting state for delete operation
}

const UrlInputBox: React.FC<UrlInputBoxProps> = ({
  url,
  onChange,
  onRemove,
  onSubmit,
  onDelete,
  placeholder,
  colorClass,
  disabled = false,
  readonly = false,
  loading = false,
  deleting = false,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  // Handle delete action for readonly mode
  const handleDeleteClick = () => {
    if (onDelete) {
      console.log("Calling onDelete function...");
      onDelete();
    }
  };

  // Handle remove animation for editable mode
  const handleRemoveClick = () => {
    if (onRemove) {
      console.log("Calling onRemove function...");
      setIsRemoving(true);
      // Add small delay for animation
      setTimeout(() => {
        onRemove();
        setIsRemoving(false);
      }, 200);
    }
  };

  // Reset states when URL changes
  useEffect(() => {
    if (!url) {
      setIsRemoving(false);
    }
  }, [url]);

  // Determine input styling based on state
  const getInputClassName = () => {
    const baseClassName =
      "w-full px-3 py-2 pr-10 border rounded transition-all duration-300 ease-in-out ";

    if (readonly) {
      return (
        baseClassName +
        "bg-green-50 border-green-300 text-green-800 cursor-not-allowed placeholder-gray-400"
      );
    }

    if (disabled || loading || deleting) {
      return (
        baseClassName +
        "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed placeholder-gray-400"
      );
    }

    if (isRemoving) {
      return (
        baseClassName +
        "bg-red-50 border-red-300 text-red-700 transform scale-95 placeholder-gray-400"
      );
    }

    return (
      baseClassName +
      "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-blue-300 placeholder-gray-400"
    );
  };

  // Determine button styling
  const getButtonClassName = () => {
    const baseClassName =
      "px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 ";

    if (readonly) {
      if (deleting) {
        return (
          baseClassName +
          "bg-red-200 text-red-800 cursor-not-allowed border border-red-300"
        );
      }
      return (
        baseClassName +
        "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 hover:scale-105"
      );
    }

    const disabledClass =
      disabled && !readonly ? " opacity-50 cursor-not-allowed" : "";
    return (
      baseClassName +
      "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 hover:scale-105" +
      disabledClass
    );
  };

  // Render delete button content
  const renderDeleteButtonContent = () => {
    if (readonly) {
      if (deleting) {
        return (
          <>
            <FaSpinner className="w-3 h-3 animate-spin" />
            <span>Deleting...</span>
          </>
        );
      }
      return (
        <>
          <FaTrash className="w-3 h-3" />
          <span>Delete</span>
        </>
      );
    }

    return (
      <>
        <FaTrash
          className={`w-3 h-3 transition-transform duration-200 ${
            isRemoving ? "scale-110" : ""
          }`}
        />
        <span>{isRemoving ? "Removing..." : "Remove"}</span>
      </>
    );
  };

  return (
    <div
      className={`flex flex-col gap-2 mt-2 transition-all duration-300 ${
        colorClass || ""
      } ${isRemoving ? "opacity-75 transform scale-95" : ""}`}
    >
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="url"
            className={getInputClassName()}
            placeholder={placeholder || "Enter URL or description"}
            value={url}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                url &&
                !readonly &&
                !disabled &&
                !loading
              ) {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={disabled || loading || deleting}
            readOnly={readonly}
          />

          {/* Status icon inside input */}
          {readonly && !deleting && (
            <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4 transition-all duration-200" />
          )}
          {loading && !deleting && (
            <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
          )}
          {deleting && (
            <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4 animate-spin" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {url &&
            (readonly ? (
              <button
                type="button"
                className={getButtonClassName()}
                onClick={(e) => {
                  console.log("Delete button clicked!", {
                    readonly,
                    onDelete,
                  });
                  e.preventDefault();
                  handleDeleteClick();
                }}
                disabled={disabled || loading || deleting}
                title="Delete evidence permanently"
              >
                {renderDeleteButtonContent()}
              </button>
            ) : (
              <button
                type="button"
                className={getButtonClassName()}
                onClick={(e) => {
                  console.log("Remove button clicked!", {
                    readonly,
                    onRemove,
                  });
                  e.preventDefault();
                  handleRemoveClick();
                }}
                disabled={disabled || loading || deleting}
                title="Remove evidence"
              >
                {renderDeleteButtonContent()}
              </button>
            ))}

          {/* Submit button */}
          {!readonly && (
            <button
              type="button"
              className={`px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 shadow-sm ${
                disabled || loading || deleting || !url
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 border border-green-600 hover:scale-105"
              }`}
              onClick={onSubmit}
              disabled={disabled || loading || deleting || !url}
            >
              {loading ? (
                <>
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-3 h-3" />
                  <span>Submit</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status indicators and submitted URL */}
      {readonly && url && !deleting && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <FaCheck className="text-green-500 w-4 h-4" />
            <span className="text-green-700 font-medium text-sm">
              Evidence Submitted
            </span>
          </div>
          <a
            href={url.startsWith("http") ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm hover:text-blue-800 break-all block"
          >
            {url}
          </a>
        </div>
      )}

      {/* Deleting status message */}
      {deleting && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center gap-2">
            <FaSpinner className="text-red-500 w-4 h-4 animate-spin" />
            <span className="text-red-700 font-medium text-sm">
              Deleting evidence...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlInputBox;
