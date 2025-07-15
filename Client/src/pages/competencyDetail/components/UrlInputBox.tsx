import React from "react";

/**
 * UrlInputBox component allows users to input, submit, and remove URLs.
 * It includes validation to ensure the URL is correctly formatted.
 * @param {UrlInputBoxProps} props - The properties for the UrlInputBox component
 * @returns {JSX.Element} The rendered UrlInputBox component.
 */

interface UrlInputBoxProps {
  url: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onSubmit: () => void;
  placeholder?: string;
  colorClass?: string;
  maxLength?: number;
  showValitationError?: boolean;
  onValidationError?: (error: string | null) => void;
}

const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  // Check if URL is empty
  if (!url.trim()) {
    return { isValid: false, error: "URL cannot be empty" };
  }

  // Check length limit (prevent buffer overflow)
  if (url.length > 2048) {
    return {
      isValid: false,
      error: "URL exceeds maximum length of 2048 characters",
    };
  }

  try {
    const urlObj = new URL(url);

    // Check if URL has a valid protocol
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { isValid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    if (urlObj.hostname.length === 0) {
      return { isValid: false, error: "Invalid URL: hostname cannot be empty" };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
};

const sanitizeUrl = (url: string): string => {
  return url
    .trim()
    .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
    .substring(0, 2048); // Enforce max length
};

/**
 * UrlInputBox component
 * @param {UrlInputBoxProps} props - The properties for the UrlInputBox component
 * @returns {JSX.Element} The rendered UrlInputBox component.
 */

const UrlInputBox: React.FC<UrlInputBoxProps> = ({
  url,
  onChange,
  onRemove,
  onSubmit,
  placeholder,
  colorClass,
  maxLength = 2048,
  showValitationError = true,
  onValidationError,
}) => {
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const handleInputChange = (value: string) => {
  // Sanitize input
  const sanitizedValue = sanitizeUrl(value);
    
  // Validate
  const validation = validateUrl(sanitizedValue);
  const error = validation.isValid ? null : validation.error || null;
    
  setValidationError(error);
  onValidationError?.(error);
    
  // Call parent onChange with sanitized value
  onChange(sanitizedValue);
};

const handleSubmit = () => {
  const validation = validateUrl(url);
  if (validation.isValid) {
    onSubmit();
  } else {
    setValidationError(validation.error || "Invalid URL");
    onValidationError?.(validation.error || "Invalid URL");
  }
};

const isValid = validateUrl(url).isValid;

return (
  <div className={`flex flex-col gap-2 mt-2 ${colorClass || ""}`}>
    <div className="flex gap-2">
      <input
        type="url"
        className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400 transition-all duration-300"
        placeholder={placeholder || "Enter URL"}
        value={url}
        maxLength={maxLength}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && url) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      {url && (
        <button
          type="button"
          className="px-3 py-2 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition"
          onClick={onRemove}
        >
          Remove
        </button>
      )}
      <button
        type="button"
        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition shadow-md"
        onClick={onSubmit}
        disabled={!url}
      >
        Submit
      </button>
    </div>
  </div>
);

export default UrlInputBox;
