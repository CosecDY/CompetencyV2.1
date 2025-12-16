import React from "react";
import SfiaSkillLevels from "./SfiaSkillLevels";
import { OverviewSection, NotesSection } from "../ui/OverviewAndNotes";
import { SfiaCompetency } from "../../types/sfia";

interface SfiaSectionProps {
  competency: SfiaCompetency;
}

/**
 * SfiaSection Component
 *
 * Main container for displaying SFIA competency information including:
 * - Overview section with general description
 * - Notes section with additional information
 * - Skill levels with interactive evidence submission
 */
const SfiaSection: React.FC<SfiaSectionProps> = ({ competency }) => {
  return (
    <>
      {/* Render the overview section with the competency's overall description */}
      {/* If the competency has no overall description, this section will not render */}
      {/* The overall description is expected to be a string */}
      <OverviewSection overall={competency?.overall} />

      {/* Render the notes section with any additional notes related to the competency */}
      {/* If the competency has no notes, this section will not render */}
      {/* The note is expected to be a string */}
      <NotesSection note={competency?.note} />

      {/* Render the skill levels section if the competency has defined levels */}
      {/* The levels are expected to be an array of objects, each containing skill level details */}
      {/* Each skill level is associated with a competency ID for identification */}
      {/* This section will render only if there are levels defined in the competency */}
      {competency?.levels && competency.levels.length > 0 && (
        <SfiaSkillLevels
          levels={competency.levels}
          skillCode={competency.competency_id}
        />
      )}
    </>
  );
};

export default SfiaSection;
