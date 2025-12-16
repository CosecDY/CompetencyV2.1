// Core competency data management hooks
export { useCompetencyDetail } from './useCompetencyDetail';
export { useSfiaSkillDetail } from './useSfiaSkillDetail';
export { useTpqiUnitDetail } from './useTpqiUnitDetail';
export { useCompetencyActions } from './useCompetencyActions';
export { useCompetencyDetailError } from './useCompetencyDetailError';

// Re-export competency-related types
export type { 
  CompetencyDetailState, 
  MultipleCompetencyDetailState,
  UseCompetencyDetailOptions,
  CompetencySource,
  CompetencyRequest,
  CacheEntry
} from '../types';
