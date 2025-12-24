import React from "react";
import Button, { ButtonVariant, ButtonSize } from "./Button";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const DotProgress: React.FC = () => (
  <span className="inline-flex ml-1">
    <span className="animate-[bounce_1s_infinite_0ms]">.</span>
    <span className="animate-[bounce_1s_infinite_200ms]">.</span>
    <span className="animate-[bounce_1s_infinite_400ms]">.</span>
  </span>
);

const LoadingButton: React.FC<LoadingButtonProps> = ({ isLoading = false, loadingText = "Loading", disabled, variant = "secondary", size = "md", children, className, ...rest }) => {
  const isDisabled = disabled || isLoading;

  return (
    <Button
      disabled={isDisabled}
      variant={variant}
      size={size}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center select-none transition-all ${className ?? ""}`}
      {...rest}
    >
      <span className="flex items-center">
        {isLoading ? (
          <>
            {loadingText}
            <DotProgress />
          </>
        ) : (
          children
        )}
      </span>
    </Button>
  );
};

export default LoadingButton;
