import React from "react";
import type { SfiaLevel, SfiaDescription } from "../../types/sfia";
import type { TpqiUnit } from "../../types/tpqi";

type LegacySfiaData = {
  competency?: { levels?: SfiaLevel[] | null } | null;
  totalLevels?: number;
};

type LegacyTpqiData = {
  totalSkills?: number;
  totalKnowledge?: number;
  totalOccupational?: number;
};

type StatsCardProps =
  | {
      source: "sfia";
      competencyData: SfiaLevel[] | LegacySfiaData; // array of levels or legacy object
    }
  | {
      source: "tpqi";
      competencyData: TpqiUnit[] | LegacyTpqiData; // array of units or legacy totals
    };

const StatsCard: React.FC<StatsCardProps> = ({ source, competencyData }) => {
  // Helper functions for calculating subskills
  const countDescriptionSubskills = (description: SfiaDescription): number => {
    if (!description.subskills) return 0;

    return description.subskills.filter((subskill) =>
      subskill.subskill_text?.trim()
    ).length;
  };

  const countLevelSubskills = (level: SfiaLevel): number => {
    if (!level.descriptions) return 0;

    return level.descriptions.reduce(
      (sum, desc) => sum + countDescriptionSubskills(desc),
      0
    );
  };

  // Calculate totals based on source
  const totals = (() => {
    if (source === "sfia") {
      const levels: SfiaLevel[] = Array.isArray(competencyData)
        ? competencyData
        : competencyData.competency?.levels ?? [];
      const totalLevels = Array.isArray(competencyData)
        ? levels.length
        : competencyData.totalLevels ?? levels.length;
      const totalSubskills = Array.isArray(levels)
        ? levels.reduce((total, level) => total + countLevelSubskills(level), 0)
        : 0;
      return { totalLevels, totalSubskills };
    }
    // TPQI
    if (Array.isArray(competencyData)) {
      const units = competencyData;
      const totalOccupational = units.length;
      const totalSkills = units.reduce(
        (sum, u) => sum + (u.skills?.length || 0),
        0
      );
      const totalKnowledge = units.reduce(
        (sum, u) => sum + (u.knowledge?.length || 0),
        0
      );
      return { totalOccupational, totalSkills, totalKnowledge };
    }
    return {
      totalOccupational: competencyData.totalOccupational ?? 0,
      totalSkills: competencyData.totalSkills ?? 0,
      totalKnowledge: competencyData.totalKnowledge ?? 0,
    };
  })();

  // Render SFIA stats
  const renderSfiaStats = () => {
    if (source !== "sfia") return null;
    return (
      <>
        <StatRow
          label="Levels"
          value={totals.totalLevels}
          colorClass="text-blue-600"
        />
        <StatRow
          label="Subskills"
          value={totals.totalSubskills}
          colorClass="text-blue-600"
        />
      </>
    );
  };

  // Render TPQI stats
  const renderTpqiStats = () => {
    if (source !== "tpqi") return null;
    return (
      <>
        <StatRow
          label="Skills"
          value={totals.totalSkills}
          colorClass="text-green-600"
        />
        <StatRow
          label="Knowledge"
          value={totals.totalKnowledge}
          colorClass="text-green-600"
        />
        <StatRow
          label="Occupational"
          value={totals.totalOccupational}
          colorClass="text-green-600"
        />
      </>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 min-w-64 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="font-semibold text-gray-800 mb-4 text-lg">📊 Overview</h3>

      <div className="space-y-4">
        {renderSfiaStats()}
        {renderTpqiStats()}

        {/* Show a friendly message when no data is available */}
        {!renderSfiaStats() && !renderTpqiStats() && (
          <div className="text-gray-500 text-center py-4">
            <span className="text-2xl">🔍</span>
            <p className="mt-2">No statistics available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable component for stat rows
interface StatRowProps {
  label: string;
  value?: number;
  colorClass: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, value = 0, colorClass }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className={`font-semibold ${colorClass} text-lg`}>
      {value.toLocaleString()}
    </span>
  </div>
);

export default StatsCard;
