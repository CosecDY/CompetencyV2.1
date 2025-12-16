import React from "react";
import { Team } from "../../types/team.types";
import { AnimatedTitle, AnimatedDivider } from "./AnimatedComponents";
import { MemberCard } from "./MemberCard";

interface TeamYearSectionProps {
  year: string;
  teams: Team[];
  yearIndex: number;
}

export const TeamYearSection: React.FC<TeamYearSectionProps> = ({
  year,
  teams,
  yearIndex,
}) => {
  return (
    <div className="mb-16">
      <AnimatedTitle delay={yearIndex * 100}>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
          ปี {year}
        </h2>
      </AnimatedTitle>

      <AnimatedDivider delay={yearIndex * 100 + 200} />

      {teams.map((team, teamIndex) => (
        <TeamSection
          key={`${team.teamName ?? "team"}-${team.teamYear}`}
          team={team}
          yearIndex={yearIndex}
          teamIndex={teamIndex}
        />
      ))}
    </div>
  );
};

interface TeamSectionProps {
  team: Team;
  yearIndex: number;
  teamIndex: number;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  yearIndex,
  teamIndex,
}) => {
  return (
    <div className="mb-12">
      {team.teamName && (
        <AnimatedTitle delay={yearIndex * 100 + teamIndex * 50 + 300}>
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-semibold text-teal-700 mb-2">
              {team.teamName}
            </h3>
            <div className="w-8 h-px bg-teal-300 mx-auto" />
          </div>
        </AnimatedTitle>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.members.map((member, memberIndex) => (
          <MemberCard
            key={member.email ?? member.tel}
            {...member}
            delay={memberIndex * 150}
          />
        ))}
      </div>
    </div>
  );
};
