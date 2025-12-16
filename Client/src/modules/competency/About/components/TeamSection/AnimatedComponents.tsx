import React from "react";
import { useInView } from "../../hooks/useInView";

interface AnimatedTitleProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  children,
  delay = 0,
}) => {
  const [ref, isInView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-800 ${
        isInView
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95"
      }`}
      style={{
        transitionDelay: isInView ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
};

interface AnimatedDividerProps {
  delay?: number;
}

export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({
  delay = 0,
}) => {
  const [ref, isInView] = useInView(0.3);

  return (
    <div
      ref={ref}
      className={`w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto mb-12 rounded-full shadow-sm transform transition-all duration-600 ${
        isInView ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
      }`}
      style={{
        transitionDelay: isInView ? `${delay}ms` : "0ms",
      }}
    />
  );
};
