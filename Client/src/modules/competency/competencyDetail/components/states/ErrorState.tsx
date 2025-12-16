import React from "react";
import { FaTimesCircle, FaRedo, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

interface ErrorStateProps {
  error: string;
  source?: string;
  id?: string;
  retryCount: number;
  onRetry: () => void;
  onGoBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  source,
  id,
  retryCount,
  onRetry,
  onGoBack,
}) => (
  <motion.div
    key="error"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="max-w-2xl mx-auto text-center py-1"
  >
    <motion.div variants={itemVariants}>
      <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
    </motion.div>
    <motion.h1
      variants={itemVariants}
      className="text-3xl font-bold text-gray-800 mb-4"
    >
      Oops! Something went wrong
    </motion.h1>
    <motion.div
      variants={itemVariants}
      className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <p className="text-red-700 font-medium mb-2">
        {typeof error === "string"
          ? error
          : "An error occurred while loading competency data"}
      </p>
      <p className="text-red-600 text-sm">
        Failed to load {source?.toUpperCase()} competency: {id}
      </p>
    </motion.div>
    <motion.div variants={itemVariants}>
      <h3 className="font-medium text-gray-800 mb-3">What you can try:</h3>
      <ul className="text-sm text-gray-600 space-y-1 mb-6">
        {[
          "Check your internet connection",
          "Verify the competency code is correct",
          "Try again in a few moments",
        ].map((rec) => (
          <li key={rec} className="flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
            {rec}
          </li>
        ))}
      </ul>
    </motion.div>
    <motion.div
      variants={itemVariants}
      className="flex flex-col sm:flex-row gap-4 justify-center"
    >
      <button
        onClick={onRetry}
        className="flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
      >
        <FaRedo className="w-4 h-4" />
        <span>Try Again</span>
      </button>
      <button
        onClick={onGoBack}
        className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>
    </motion.div>
    {retryCount > 0 && (
      <motion.div
        variants={itemVariants}
        className="mt-6 text-xs text-gray-500"
      >
        Retry attempts: {retryCount} | Last error:{" "}
        {new Date().toLocaleTimeString()}
      </motion.div>
    )}
  </motion.div>
);

export default ErrorState;
