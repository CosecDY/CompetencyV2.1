import { SfiaLevel, SfiaDescription } from "../types/sfia";

/**
 * Determines whether a given SFIA description contains valid content.
 * A description is considered valid if it has non-empty description text or at least one subskill with content.
 *
 * @param {SfiaDescription} desc - The SFIA description object to evaluate.
 * @returns {boolean} - Returns true if the description contains valid content; otherwise, false.
 */
export const hasValidContent = (desc: SfiaDescription): boolean => {
  const hasDescriptionText = desc.description_text?.trim();
  const hasSubSkills = desc.subskills?.some((subskill) =>
    subskill.subskill_text?.trim()
  );
  return !!(hasDescriptionText || hasSubSkills);
};

/**
 * Filters a list of SFIA levels to include only those that contain valid descriptions.
 * A level is considered valid if at least one of its descriptions has valid content.
 *
 * @param {SfiaLevel[]} levels - An array of SFIA levels to filter.
 * @returns {SfiaLevel[]} - A filtered array containing only levels with valid descriptions.
 */
export const filterValidLevels = (levels: SfiaLevel[]): SfiaLevel[] => {
  return levels.filter((level) => {
    if (!level.descriptions?.length) {
      return false;
    }
    const hasValidDescriptions = level.descriptions.some(hasValidContent);
    return hasValidDescriptions;
  });
};

/**
 * Counts the total number of subskills across a list of SFIA descriptions.
 * Only subskills with non-empty content are counted.
 *
 * @param {SfiaDescription[]} descriptions - An array of SFIA descriptions to analyze.
 * @returns {number} - The total count of subskills containing non-empty content.
 */
export const countSubskills = (descriptions: SfiaDescription[]): number => {
  return descriptions.reduce((count, desc) => {
    return (
      count +
      (desc.subskills?.filter((subskill) => subskill.subskill_text?.trim())
        .length || 0)
    );
  }, 0);
};
