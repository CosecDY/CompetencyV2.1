import React from "react";
import TpqiSkillKnowledgeItems from "./TpqiSkillKnowledgeItems";
import { TpqiUnit } from "@Pages/competencyDetail/types/tpqi";
import { OverviewSection } from "../ui/OverviewAndNotes";
import { TpqiCompetency } from "./types";

interface TpqiContainerProps {
  competency: TpqiCompetency;
}

// TpqiContainer component
/**
 * Renders the TPQI section of a competency detail page.
 * Uses the new evidence-based TPQI structure for skills and knowledge submission.
 *
 * @param {TpqiContainerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const TpqiContainer: React.FC<TpqiContainerProps> = ({ competency }) => {
  // Convert the API structure to TpqiUnit format for evidence submission
  const tpqiUnits: TpqiUnit[] = [];

  // Create a single unit combining all skills and knowledge
  if (
    competency &&
    (competency.skills?.length > 0 || competency.knowledge?.length > 0)
  ) {
    const unit: TpqiUnit = {
      id: 1,
      unit_code: competency.competency_id || "TPQI_UNIT",
      unit_name: competency.competency_name || "TPQI Competency Unit",
      skills:
        competency.skills?.map((skill) => ({
          id: skill.id,
          skill_name: skill.name_skill,
          skill_description: undefined, // Add description if available in API
        })) || [],
      knowledge:
        competency.knowledge?.map((knowledge) => ({
          id: knowledge.id,
          knowledge_name: knowledge.name_knowledge,
          knowledge_description: undefined, // Add description if available in API
        })) || [],
    };

    tpqiUnits.push(unit);
  }

  return (
    <>
      <OverviewSection overall={competency?.overall} />

      {/* Use new evidence-based TPQI component */}
      {tpqiUnits.length > 0 && (
        <TpqiSkillKnowledgeItems
          units={tpqiUnits}
          unitCode={competency?.competency_id || "TPQI_EVIDENCE"}
        />
      )}

      {/* Handle occupational items separately if needed */}
      {competency?.occupational && competency.occupational.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Occupational Items
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            Note: Occupational items are displayed for reference. Evidence
            submission is available for Skills and Knowledge only.
          </p>
          <ul className="space-y-2">
            {competency.occupational.map((occ) => (
              <li key={occ.id} className="text-yellow-800">
                • {occ.name_occupational}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default TpqiContainer;
