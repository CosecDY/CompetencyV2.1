// Common interfaces for TPQI components
export interface TpqiItem {
  id: string;
  name: string;
}

export interface TpqiSkill extends TpqiItem {
  name_skill: string;
}

export interface TpqiKnowledge extends TpqiItem {
  name_knowledge: string;
}

export interface TpqiOccupational extends TpqiItem {
  name_occupational: string;
}

export interface TpqiSectionProps {
  overall?: string;
}

export interface TpqiSkillsProps extends TpqiSectionProps {
  skills: Array<{ id: string; name_skill: string }>;
}

export interface TpqiKnowledgeProps extends TpqiSectionProps {
  knowledge: Array<{ id: string; name_knowledge: string }>;
}

export interface TpqiOccupationalProps extends TpqiSectionProps {
  occupational: Array<{ id: string; name_occupational: string }>;
}

export interface ColorScheme {
  gradient: string;
  border: string;
  accent: string;
  decorative: string[];
  overviewBg: string;
  overviewBorder: string;
  overviewText: string;
  itemBorder: string;
  itemShadow: string;
  itemAccent: string;
  itemDecorativeDot: string;
  itemText: string;
  itemBorderClass: string;
}

export interface TpqiItemColorScheme {
  accent: string;
  border: string;
  shadow: string;
  decorativeDot: string;
  text: string;
  borderClass: string;
}

export interface TpqiCompetency {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  occupational: Array<{
    id: number;
    name_occupational: string;
  }>;
  sector: Array<{
    id: number;
    name_sector: string;
  }>;
  skills: Array<{
    id: number;
    name_skill: string;
  }>;
  knowledge: Array<{
    id: number;
    name_knowledge: string;
  }>;
}
