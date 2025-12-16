export interface MemberProps {
  name: string;
  englishName: string;
  image: string;
  education: string;
  faculty: string;
  email?: string;
  tel: string;
}

export interface Team {
  teamName?: string;
  teamYear: string;
  members: MemberProps[];
}

export interface GroupedTeams {
  [year: string]: Team[];
}
