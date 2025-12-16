import React from "react";
import { motion, Variants } from "framer-motion";
import type { SfiaLevel } from "../../types/sfia";
import type { TpqiUnit } from "../../types/tpqi";
import BackButton from "../ui/BackButton";
import HeaderActions from "../ui/HeaderActions";
import FrameworkBadge from "../ui/FrameworkBadge";
import QuickNavigation from "../ui/QuickNavigation";
import CompetencyInfo from "../ui/CompetencyInfo";

interface QuickNavItem {
  label: string;
  href: string;
}

type BasePageHeaderProps = {
  id: string;
  competencyTitle: string;
  lastFetched?: Date;
  quickNavItems: QuickNavItem[];
  isBookmarked: boolean;
  isFavorited: boolean;
  onBack: () => void;
  onBookmark: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onTooltip: (key: string | null) => void;
  getFrameworkIcon: (framework: string) => React.ReactNode;
  getFrameworkColor: (framework: string) => string;
  itemVariants: Variants | undefined;
};

type SfiaHeaderProps = BasePageHeaderProps & {
  source: "sfia";
  // Use SFIA levels array (adjust if your StatsCard expects a different SFIA shape)
  competencyData: SfiaLevel[];
};

type TpqiHeaderProps = BasePageHeaderProps & {
  source: "tpqi";
  // Use TPQI units array (adjust if your StatsCard expects a different TPQI shape)
  competencyData: TpqiUnit[];
};

type PageHeaderProps = SfiaHeaderProps | TpqiHeaderProps;

const PageHeader: React.FC<PageHeaderProps> = ({
  source,
  id,
  competencyTitle,
  lastFetched,
  quickNavItems,
  isBookmarked,
  isFavorited,
  onBack,
  onBookmark,
  onFavorite,
  onShare,
  onPrint,
  onDownload,
  onTooltip,
  getFrameworkIcon,
  getFrameworkColor,
  itemVariants,
}) => {
  return (
    <motion.header variants={itemVariants} className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <BackButton onClick={onBack} />

        <HeaderActions
          isBookmarked={isBookmarked}
          isFavorited={isFavorited}
          onBookmark={onBookmark}
          onFavorite={onFavorite}
          onShare={onShare}
          onPrint={onPrint}
          onDownload={onDownload}
          onTooltip={onTooltip}
        />
      </div>

      {/* Enhanced Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <FrameworkBadge
              framework={source}
              getFrameworkIcon={getFrameworkIcon}
              getFrameworkColor={getFrameworkColor}
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
            {competencyTitle}
          </h1>

          <CompetencyInfo id={id} lastFetched={lastFetched} />

          <QuickNavigation source={source} items={quickNavItems} />
        </div>
      </div>
    </motion.header>
  );
};

export default PageHeader;
