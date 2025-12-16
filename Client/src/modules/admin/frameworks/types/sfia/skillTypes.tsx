export interface Skill {
  id: number;
  code: string;
  name: string | null;
  overview: string | null;
  note: string | null;
  levelId?: number;
  categoryId?: number;
}

export interface SubSkill { id: number; text: string; skillCode?: string | null; descriptionId?: number; }
export interface LevelRef { id: number; name: string; }

export interface SkillPageResult {
  data: Array<Skill & { subSkills?: SubSkill[]; levels?: LevelRef[] }>;
  total?: number;
}

export type CreateSkillDto = Partial<Omit<Skill, "id" | "code">>;
export type UpdateSkillDto = Partial<Omit<Skill, "id" | "code">>;