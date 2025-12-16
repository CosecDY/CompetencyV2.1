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
    primary: "bg-admin-primary text-admin-texts hover:bg-admin-hover shadow-sm border border-transparent",
    secondary: "bg-admin-surface text-admin-text border border-admin-border hover:bg-admin-bg",
    danger: "bg-danger text-white hover:bg-danger-hover border border-transparent",
    outline: "bg-transparent border border-admin-primary text-admin-primary hover:bg-admin-light",
    ghost: "bg-transparent text-admin-primary hover:bg-admin-light border border-transparent",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-admin-primary/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button disabled={isLoading || disabled} className={classNames(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      {isLoading ? <BiLoaderAlt className="animate-spin text-xl" /> : leftIcon && <span className={size === "sm" ? "text-base" : "text-xl"}>{leftIcon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
