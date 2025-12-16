import React from "react";
import classNames from "classnames";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, noPadding = false }) => {
  return (
    <div
      className={classNames(
        "bg-admin-surface border border-admin-border rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-md",

        noPadding ? "p-0 overflow-hidden" : "p-5 md:p-6",

        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
