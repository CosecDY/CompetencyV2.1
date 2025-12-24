import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonLoader } from "../ui";

/**
 * Enhanced SearchLoadingState Component with Advanced Logic
 *
 * Features:
 * - Intelligent progress simulation based on search complexity
 * - Dynamic loading messages with context-aware content
 * - Performance optimizations with memoization
 * - Responsive design with accessibility support
 * - Enhanced visual feedback with multiple loading indicators
 */
const SearchLoadingState: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<"connecting" | "searching" | "processing" | "finalizing">("connecting");

  // Memoized loading messages with contextual phases
  const loadingMessages = useMemo(
    () => [
      { text: "กำลังเชื่อมต่อฐานข้อมูล...", phase: "connecting", duration: 800 },
      { text: "กำลังค้นหาข้อมูล SFIA...", phase: "searching", duration: 1000 },
      { text: "กำลังค้นหาข้อมูล TPQI...", phase: "searching", duration: 1000 },
      { text: "กำลังประมวลผลข้อมูล...", phase: "processing", duration: 1200 },
      { text: "กำลังจัดเรียงผลลัพธ์...", phase: "processing", duration: 800 },
      { text: "เกือบเสร็จแล้ว...", phase: "finalizing", duration: 600 },
    ],
    []
  );

  // Intelligent progress calculation based on phase
  const updateProgress = useCallback(() => {
    setSearchProgress((prev) => {
      const phaseProgress = {
        connecting: { min: 0, max: 20, speed: 8 },
        searching: { min: 20, max: 60, speed: 6 },
        processing: { min: 60, max: 85, speed: 4 },
        finalizing: { min: 85, max: 95, speed: 2 },
      };

      const currentPhaseConfig = phaseProgress[loadingPhase];
      const increment = Math.random() * currentPhaseConfig.speed + 2;
      const next = prev + increment;

      // Update phase based on progress
      if (next >= 20 && loadingPhase === "connecting") setLoadingPhase("searching");
      else if (next >= 60 && loadingPhase === "searching") setLoadingPhase("processing");
      else if (next >= 85 && loadingPhase === "processing") setLoadingPhase("finalizing");

      return Math.min(next, currentPhaseConfig.max);
    });
  }, [loadingPhase]);

  // Enhanced message cycling with intelligent timing
  const cycleMessage = useCallback(() => {
    setCurrentMessage((prev) => {
      const nextIndex = (prev + 1) % loadingMessages.length;
      return nextIndex;
    });
  }, [loadingMessages.length]);

  // Optimized effect management
  useEffect(() => {
    const progressInterval = setInterval(updateProgress, 150);
    const messageTimeout = setTimeout(cycleMessage, loadingMessages[currentMessage]?.duration || 1000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(messageTimeout);
    };
  }, [currentMessage, updateProgress, cycleMessage, loadingMessages]);

  // Memoized animation variants for performance
  const containerVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: { duration: 0.3, ease: "easeIn" },
      },
    }),
    []
  );

  // Phase-based colors for visual feedback
  const phaseColors = useMemo(
    () => ({
      connecting: "from-blue-500 to-blue-600",
      searching: "from-teal-500 to-teal-600",
      processing: "from-purple-500 to-purple-600",
      finalizing: "from-green-500 to-green-600",
    }),
    []
  );

  // Helper function for phase indicator styling
  const getPhaseIndicatorClass = useCallback(
    (phase: string, index: number) => {
      const phases = ["connecting", "searching", "processing", "finalizing"];
      const currentPhaseIndex = phases.indexOf(loadingPhase);

      if (loadingPhase === phase) return "bg-teal-500";
      if (currentPhaseIndex > index) return "bg-teal-300";
      return "bg-gray-200";
    },
    [loadingPhase]
  );

  return (
    <motion.div key="loading" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
      {/* Enhanced Loading Header */}
      <div className="text-center py-8 flex-1 flex items-center justify-center">
        <motion.div
          className="inline-flex flex-col items-center space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 min-w-[320px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Enhanced Multi-Layer Loading Spinner */}
          <div className="relative">
            <motion.div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <motion.div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-400 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className={`w-2 h-2 bg-gradient-to-r ${phaseColors[loadingPhase]} rounded-full`} />
            </motion.div>
          </div>

          {/* Dynamic Content with Enhanced UX */}
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">กำลังค้นหาข้อมูล</h3>

            {/* Context-Aware Animated Status Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`${currentMessage}-${loadingPhase}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-600 text-sm min-h-[20px] font-medium"
              >
                {loadingMessages[currentMessage]?.text}
              </motion.p>
            </AnimatePresence>

            {/* Enhanced Progress Bar with Phase-Based Styling */}
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
              <motion.div
                className={`bg-gradient-to-r ${phaseColors[loadingPhase]} h-2 rounded-full shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${searchProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{Math.round(searchProgress)}% เสร็จสิ้น</span>
              <span className="capitalize text-teal-600 font-medium">{loadingPhase}</span>
            </div>

            {/* Enhanced Database Status Indicators */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
              <motion.div
                className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-100"
                animate={{ scale: loadingPhase === "searching" ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1.5, repeat: loadingPhase === "searching" ? Infinity : 0 }}
              >
                <motion.span className="w-2 h-2 bg-green-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="font-medium">SFIA Database</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2 p-2 bg-teal-50 rounded-lg border border-teal-100"
                animate={{ scale: loadingPhase === "searching" ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1.5, repeat: loadingPhase === "searching" ? Infinity : 0, delay: 0.3 }}
              >
                <motion.span className="w-2 h-2 bg-teal-400 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                <span className="font-medium">TPQI Database</span>
              </motion.div>
            </div>

            {/* Loading Phase Indicator */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                {["connecting", "searching", "processing", "finalizing"].map((phase, index) => (
                  <motion.div
                    key={phase}
                    className={`w-2 h-2 rounded-full ${getPhaseIndicatorClass(phase, index)}`}
                    animate={loadingPhase === phase ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.8, repeat: loadingPhase === phase ? Infinity : 0 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Skeleton Loading Results */}
      <motion.div className="max-w-6xl mx-auto px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <SkeletonLoader count={4} />
      </motion.div>
    </motion.div>
  );
};

export default SearchLoadingState;
