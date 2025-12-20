import React from "react";
import classNames from "classnames";
import { BiLoaderAlt } from "react-icons/bi";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = "primary", size = "md", isLoading = false, leftIcon, children, className, disabled, ...props }) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 border border-transparent",
    secondary: "bg-surface text-main-text border border-border hover:bg-background",
    danger: "bg-red-500 text-white hover:bg-red-600 border border-transparent shadow-md shadow-red-500/20",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-primary hover:bg-primary/10 border border-transparent",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  return (
    <button disabled={isLoading || disabled} className={classNames(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <BiLoaderAlt className="animate-spin text-xl" />
        ) : (
          leftIcon && <span className={classNames("inline-flex items-center justify-center", size === "sm" ? "text-base" : "text-xl")}>{leftIcon}</span>
        )}

        <span className="leading-none select-none">{children}</span>
      </div>
    </button>
  );
};

export default Button;
