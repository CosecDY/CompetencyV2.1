/**
 * Competency Detail Hooks
 * 
 * Organized hook exports for competency detail management.
 * This barrel file provides a clean API for importing hooks throughout the application.
 */

// ====================================
// Core Competency Hooks
// ====================================
export * from './competency';

// ====================================
// Evidence Management Hooks  
// ====================================
export * from './evidence';

// ====================================
// UI-Related Hooks
// ====================================
export * from './ui';

// ====================================
// Utility Hooks
// ====================================
export * from './utils';

// ====================================
// Shared Types
// ====================================
export * from './types';

// ====================================
// Default Export (for backward compatibility)
// ====================================
export { useCompetencyDetail as default } from './competency';
