import React from "react";
import { FaArrowLeft } from "react-icons/fa";

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center text-teal-600 hover:text-teal-700 mb-6 transition-colors group"
  >
    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
    Back to results
  </button>
);

export default BackButton;
