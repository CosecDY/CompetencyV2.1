// Client/src/pages/SearchResults/components/ResultsList.tsx
import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code, GraduationCap, Database } from "lucide-react";

interface ItemType {
  id: string;
  name: string;
  framework: string;
}

interface ResultsListProps {
  items: ItemType[];
  onViewDetails: (id: string) => void;
}

// Framework-specific configurations
const getFrameworkConfig = (framework: string) => {
  const lowerFramework = framework.toLowerCase();

  switch (lowerFramework) {
    case "sfia":
      return {
        icon: <Code className="w-5 h-5" />,
        label: "SFIA",
        description: "Skills Framework for Information Age",
        colors: {
          primary: "blue",
          bg: "bg-blue-50/50",
          border: "border-blue-200/60",
          hoverBg: "hover:bg-blue-50/80",
          hoverBorder: "hover:border-blue-300",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          title: "text-blue-900",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          focusRing: "focus:ring-blue-500",
        },
      };
    case "tpqi":
      return {
        icon: <GraduationCap className="w-5 h-5" />,
        label: "TPQI",
        description: "Thailand Professional Qualification Institute",
        colors: {
          primary: "green",
          bg: "bg-green-50/50",
          border: "border-green-200/60",
          hoverBg: "hover:bg-green-50/80",
          hoverBorder: "hover:border-green-300",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          badge: "bg-green-100 text-green-700 border-green-200",
          title: "text-green-900",
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          focusRing: "focus:ring-green-500",
        },
      };
    default:
      return {
        icon: <Database className="w-5 h-5" />,
        label: framework.toUpperCase(),
        description: "Competency Framework",
        colors: {
          primary: "gray",
          bg: "bg-gray-50/50",
          border: "border-gray-200/60",
          hoverBg: "hover:bg-gray-50/80",
          hoverBorder: "hover:border-gray-300",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          title: "text-gray-900",
          button: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
          focusRing: "focus:ring-gray-500",
        },
      };
  }
};

// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const ResultsListRow: React.FC<{
  item: ItemType;
  onViewDetails: (id: string) => void;
}> = React.memo(({ item, onViewDetails }) => {
  const frameworkConfig = useMemo(
    () => getFrameworkConfig(item.framework),
    [item.framework]
  );

  const handleClick = useCallback(() => {
    onViewDetails(item.id);
  }, [item.id, onViewDetails]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onViewDetails(item.id);
      }
    },
    [item.id, onViewDetails]
  );

  // Handle button click to prevent event propagation
  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewDetails(item.id);
    },
    [item.id, onViewDetails]
  );

  return (
    <motion.div
      variants={itemVariants}
      className={`group relative w-full ${frameworkConfig.colors.bg} border ${frameworkConfig.colors.border} rounded-xl p-4 transition-all duration-300 ${frameworkConfig.colors.hoverBg} ${frameworkConfig.colors.hoverBorder} hover:shadow-lg cursor-pointer`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.name}`}
    >
      {/* Content Container */}
      <div className="flex items-center justify-between w-full">
        {/* Left Side - Icon and Content */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Framework Icon */}
          <div
            className={`flex-shrink-0 p-2 rounded-lg ${frameworkConfig.colors.iconBg}`}
          >
            <div className={frameworkConfig.colors.iconColor}>
              {frameworkConfig.icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Framework Badge */}
            <div className="mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${frameworkConfig.colors.badge}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                {frameworkConfig.label}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`text-lg font-semibold ${frameworkConfig.colors.title} mb-1 group-hover:underline decoration-2 underline-offset-2 truncate`}
            >
              {item.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 truncate">
              {frameworkConfig.description}
            </p>
          </div>
        </div>

        {/* Right Side - Action Indicator */}
        <div className="flex-shrink-0 ml-4">
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 ${frameworkConfig.colors.button} text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md pointer-events-none`}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 bg-current transition-opacity duration-300 pointer-events-none"></div>

      {/* Focus ring for accessibility */}
      <div
        className={`absolute inset-0 rounded-xl ring-2 ring-offset-2 opacity-0 focus-within:opacity-100 transition-opacity duration-200 ${frameworkConfig.colors.focusRing} pointer-events-none`}
      ></div>
    </motion.div>
  );
});

ResultsListRow.displayName = "ResultsListRow";

const ResultsList: React.FC<ResultsListProps> = ({ items, onViewDetails }) => {
  return (
    <motion.div
      className="space-y-3"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <ResultsListRow
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}
        />
      ))}
    </motion.div>
  );
};

export default ResultsList;
