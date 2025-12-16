import React, { memo } from "react";
import { TpqiUnit } from "../../types/tpqi";
import TpqiSkillKnowledgeItems from "./TpqiSkillKnowledgeItems";

interface TpqiSectionProps {
  units: TpqiUnit[];
  unitCode: string;
}

const TpqiSection: React.FC<TpqiSectionProps> = memo(({ units, unitCode }) => {
  return (
    <TpqiSkillKnowledgeItems 
      units={units} 
      unitCode={unitCode} 
    />
  );
});

TpqiSection.displayName = "TpqiSection";

export default TpqiSection;
