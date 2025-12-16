import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  count?: number;
}

/**
 * Enhanced SkeletonLoader Component
 *
 * Provides realistic skeleton loading animation for search results
 * with improved shimmer effects and staggered animations
 * to improve perceived performance during loading states
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 6 }) => {
  const shimmer = {
    initial: { backgroundPosition: "-200px 0" },
    animate: {
      backgroundPosition: "200px 0",
      transition: {
        duration: 1.5,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Title skeleton with shimmer */}
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-3 h-3 rounded-full overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
                <motion.div
                  className="h-5 rounded-lg flex-1 max-w-md overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
              </div>

              {/* Description skeleton with varied widths */}
              <div className="space-y-2 pl-6">
                <motion.div
                  className="h-4 rounded max-w-2xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
                <motion.div
                  className="h-4 rounded max-w-xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
                {/* Randomly show third line for variety */}
                {Math.random() > 0.5 && (
                  <motion.div
                    className="h-4 rounded max-w-lg overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                      backgroundSize: "200px 100%",
                    }}
                    variants={shimmer}
                    initial="initial"
                    animate="animate"
                  />
                )}
              </div>

              {/* Framework badge skeleton */}
              <div className="flex items-center space-x-2 pl-6 pt-2">
                <motion.div
                  className="h-6 w-16 rounded-full overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
                <motion.div
                  className="h-4 w-20 rounded overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                    backgroundSize: "200px 100%",
                  }}
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                />
              </div>
            </div>

            {/* Button skeleton */}
            <div className="ml-4">
              <motion.div
                className="h-9 w-24 rounded-lg overflow-hidden"
                style={{
                  background:
                    "linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%)",
                  backgroundSize: "200px 100%",
                }}
                variants={shimmer}
                initial="initial"
                animate="animate"
              />
            </div>
          </div>

          {/* Progress indicator for variety */}
          {index === 0 && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <motion.div
                  className="w-2 h-2 bg-teal-300 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span>กำลังโหลดข้อมูล...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
