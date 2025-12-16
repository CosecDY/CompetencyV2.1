import { Team, GroupedTeams } from "../types/team.types";

export const groupTeamsByYear = (teams: Team[]): GroupedTeams => {
  return teams.reduce((acc: GroupedTeams, team) => {
    if (!acc[team.teamYear]) acc[team.teamYear] = [];
    acc[team.teamYear].push(team);
    return acc;
  }, {});
};

export const sortYearsDescending = (years: string[]): string[] => {
  return years.sort((a, b) => parseInt(b) - parseInt(a));
};
