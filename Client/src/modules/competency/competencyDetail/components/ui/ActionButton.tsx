import React from "react";
import { motion } from "framer-motion";

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  isActive?: boolean;
  activeColors: string;
  inactiveColors: string;
  tooltipKey: string;
  onTooltip: (key: string | null) => void;
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" },
  },
};

const ActionButton = React.memo<ActionButtonProps>(
  ({
    onClick,
    icon,
    isActive,
    activeColors,
    inactiveColors,
    tooltipKey,
    onTooltip,
  }) => (
    <motion.button
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-200 ${
        isActive ? activeColors : inactiveColors
      }`}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onMouseEnter={() => onTooltip(tooltipKey)}
      onMouseLeave={() => onTooltip(null)}
    >
      {icon}
    </motion.button>
  )
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
