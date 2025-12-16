import React from "react";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import CacheInfo from "../../components/ui/CacheInfo";

interface PageFooterProps {
  source: "sfia" | "tpqi";
  lastFetched?: Date;
  itemVariants: any;
}

const PageFooter: React.FC<PageFooterProps> = ({
  source,
  lastFetched,
  itemVariants,
}) => {
  return (
    <motion.footer
      variants={itemVariants}
      className="mt-12 pt-8 border-t border-gray-200"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {lastFetched && <CacheInfo lastFetched={lastFetched} />}

        {/* Helpful Links */}
        <div className="flex items-center gap-4">
          <a
            href={`/${source}`}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            Browse more {source?.toUpperCase()} competencies
            <FaChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default PageFooter;
