// Evidence management hooks
export { useEvidenceFetcher } from './useSfiaEvidenceFetcher';
export { useTpqiEvidenceFetcher } from './useTpqiEvidenceFetcher';
export { useSfiaEvidenceSender } from './useSfiaEvidenceSender';
export { useTpqiEvidenceSender } from './useTpqiEvidenceSender';

// Re-export evidence-related types (will be added to main types.ts)
export type { 
  TpqiEvidenceData,
  UseTpqiEvidenceFetcherResult
} from '../types';
