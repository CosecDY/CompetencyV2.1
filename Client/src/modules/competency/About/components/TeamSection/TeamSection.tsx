// components/TeamSection.tsx
import React from "react";
import { teams } from "../../data/teamData";
import { groupTeamsByYear, sortYearsDescending } from "../../utils/teamHelper";
import { HeaderSection } from "./HeaderSection";
import { TeamYearSection } from "./TeamYearSection";

const TeamSection: React.FC = () => {
  // Group teams by year and sort in descending order
  const groupedTeams = groupTeamsByYear(teams);
  const sortedYears = sortYearsDescending(Object.keys(groupedTeams));

  return (
    <section
      id="team-section"
      className="relative min-h-screen flex flex-col items-center justify-center w-full py-20 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <HeaderSection />

        {sortedYears.map((year, yearIndex) => (
          <TeamYearSection
            key={year}
            year={year}
            teams={groupedTeams[year]}
            yearIndex={yearIndex}
          />
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
