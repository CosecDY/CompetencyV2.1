// /Client/src/pages/competencyDetail/utils/tpqiUtils.ts
import { TpqiUnit, TpqiSkill, TpqiKnowledge } from "../types/tpqi";

/**
 * Filters units with valid content
 */
export const filterValidUnits = (units: TpqiUnit[]): TpqiUnit[] => {
  return units.filter(unit => 
    unit.unit_code?.trim() && 
    unit.unit_name?.trim() && 
    (unit.skills.length > 0 || unit.knowledge.length > 0)
  );
};

/**
 * Filters skills with valid content
 */
export const filterValidSkills = (skills: TpqiSkill[]): TpqiSkill[] => {
  return skills.filter((skill) => skill.skill_name?.trim());
};

/**
 * Filters knowledge with valid content
 */
export const filterValidKnowledge = (
  knowledge: TpqiKnowledge[]
): TpqiKnowledge[] => {
  return knowledge.filter((item) => item.knowledge_name?.trim());
};

/**
 * Checks if a skill has valid content
 */
export const hasValidSkillContent = (skill: TpqiSkill): boolean => {
  return !!skill.skill_name?.trim();
};

/**
 * Checks if a knowledge item has valid content
 */
export const hasValidKnowledgeContent = (knowledge: TpqiKnowledge): boolean => {
  return !!knowledge.knowledge_name?.trim();
};

/**
 * Counts total skills and knowledge items
 */
export const countTpqiItems = (
  unit: TpqiUnit
): { skills: number; knowledge: number; total: number } => {
  const skillCount = filterValidSkills(unit.skills).length;
  const knowledgeCount = filterValidKnowledge(unit.knowledge).length;

  return {
    skills: skillCount,
    knowledge: knowledgeCount,
    total: skillCount + knowledgeCount,
  };
};

/**
 * Generates evidence key for tracking
 */
export const generateEvidenceKey = (
  type: "skill" | "knowledge",
  id: number
): string => {
  return `${type}-${id}`;
};

/**
 * Parses evidence key back to type and id
 */
export const parseEvidenceKey = (
  key: string
): { type: "skill" | "knowledge"; id: number } | null => {
  const [type, idStr] = key.split("-");
  const id = parseInt(idStr, 10);

  if ((type === "skill" || type === "knowledge") && !isNaN(id)) {
    return { type, id };
  }

  return null;
};

/**
 * Validates TPQI unit structure
 */
export const validateTpqiUnit = (unit: TpqiUnit): boolean => {
  return !!(
    unit.id &&
    unit.unit_code?.trim() &&
    unit.unit_name?.trim() &&
    (unit.skills.length > 0 || unit.knowledge.length > 0)
  );
};
