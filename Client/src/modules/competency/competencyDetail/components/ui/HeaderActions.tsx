import React from "react";
import {
  FaBookmark,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaPrint,
  FaDownload,
} from "react-icons/fa";
import ActionButton from "./ActionButton";

interface HeaderActionsProps {
  isBookmarked: boolean;
  isFavorited: boolean;
  onBookmark: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onTooltip: (key: string | null) => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  isBookmarked,
  isFavorited,
  onBookmark,
  onFavorite,
  onShare,
  onPrint,
  onDownload,
  onTooltip,
}) => {
  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={onBookmark}
        icon={<FaBookmark className="w-4 h-4" />}
        isActive={isBookmarked}
        activeColors="bg-yellow-100 border-yellow-300 text-yellow-600"
        inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-yellow-50"
        tooltipKey="bookmark"
        onTooltip={onTooltip}
      />

      <ActionButton
        onClick={onFavorite}
        icon={
          isFavorited ? (
            <FaHeart className="w-4 h-4" />
          ) : (
            <FaRegHeart className="w-4 h-4" />
          )
        }
        isActive={isFavorited}
        activeColors="bg-red-100 border-red-300 text-red-600"
        inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-red-50"
        tooltipKey="favorite"
        onTooltip={onTooltip}
      />

      <ActionButton
        onClick={onShare}
        icon={<FaShare className="w-4 h-4" />}
        activeColors=""
        inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-blue-50"
        tooltipKey="share"
        onTooltip={onTooltip}
      />

      <ActionButton
        onClick={onPrint}
        icon={<FaPrint className="w-4 h-4" />}
        activeColors=""
        inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-green-50"
        tooltipKey="print"
        onTooltip={onTooltip}
      />

      <ActionButton
        onClick={onDownload}
        icon={<FaDownload className="w-4 h-4" />}
        activeColors=""
        inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-purple-50"
        tooltipKey="download"
        onTooltip={onTooltip}
      />
    </div>
  );
};

export default HeaderActions;
