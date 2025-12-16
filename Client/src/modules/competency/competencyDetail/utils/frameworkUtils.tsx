import { FaCode, FaGraduationCap, FaTools } from "react-icons/fa";

export const getFrameworkIcon = (framework: string) => {
  switch (framework.toLowerCase()) {
    case "sfia":
      return <FaCode className="w-5 h-5" />;
    case "tpqi":
      return <FaGraduationCap className="w-5 h-5" />;
    default:
      return <FaTools className="w-5 h-5" />;
  }
};

export const getFrameworkColor = (framework: string) => {
  switch (framework.toLowerCase()) {
    case "sfia":
      return "from-blue-500 to-blue-600";
    case "tpqi":
      return "from-green-500 to-green-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};
