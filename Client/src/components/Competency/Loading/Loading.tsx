import React from "react";

interface LoadingProps {
  size?: number;
  color?: string;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 12, color = "neutral-500", message = "Loading, please wait..." }) => {
  const spinnerSize = `${size * 0.25}rem`;
  const colorClass = `text-${color}`;

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center h-screen space-y-4 
                 bg-white/50 dark:bg-neutral-900/50"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${colorClass}`}
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderColor: "#d1d5db",
          borderTopColor: "transparent",
        }}
      />
      <p className="text-sm text-gray-600 dark:text-neutral-300 animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;
