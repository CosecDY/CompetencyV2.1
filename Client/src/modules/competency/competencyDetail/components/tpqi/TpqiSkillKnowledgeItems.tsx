import React, { useMemo, useEffect, useCallback, memo } from "react";
import { FaCertificate, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { useTpqiEvidenceSender, TpqiEvidenceState, EvidenceType } from "../../hooks/evidence/useTpqiEvidenceSender";
import { useTpqiEvidenceFetcher } from "../../hooks/evidence/useTpqiEvidenceFetcher";
import { TpqiUnit, TpqiSkill, TpqiKnowledge } from "../../types/tpqi";
import { filterValidUnits, filterValidSkills, filterValidKnowledge } from "../../utils/tpqiUtils";
import { EvidenceItem } from "../shared/EvidenceItem";

// Types
interface TpqiSkillKnowledgeItemsProps {
  units: TpqiUnit[];
  unitCode: string;
}

interface EvidenceHandlers {
  onUrlChange: (evidence: EvidenceType, value: string) => void;
  onRemove: (evidence: EvidenceType) => void;
  onSubmit: (evidence: EvidenceType) => void;
  onDelete: (evidence: EvidenceType) => void;
}

interface UnitsListProps {
  filteredUnits: TpqiUnit[];
  evidenceState: TpqiEvidenceState;
  handlers: EvidenceHandlers;
}

interface UnitProps {
  unit: TpqiUnit;
  evidenceState: TpqiEvidenceState;
  handlers: EvidenceHandlers;
}

interface SkillsListProps {
  skills: TpqiSkill[];
  evidenceState: TpqiEvidenceState;
  handlers: EvidenceHandlers;
}

interface KnowledgeListProps {
  knowledge: TpqiKnowledge[];
  evidenceState: TpqiEvidenceState;
  handlers: EvidenceHandlers;
}

const TpqiSkillKnowledgeItems: React.FC<TpqiSkillKnowledgeItemsProps> = memo(({ units, unitCode }) => {
  const { evidenceState, handleUrlChange, handleRemove, handleSubmit, handleDelete, initializeEvidenceUrls } = useTpqiEvidenceSender();

  const { evidenceData, loading: evidenceLoading, error: evidenceError } = useTpqiEvidenceFetcher(unitCode);

  useEffect(() => {
    if (evidenceData && (evidenceData.skills || evidenceData.knowledge)) {
      initializeEvidenceUrls(evidenceData);
    }
  }, [evidenceData, initializeEvidenceUrls]);

  const filteredUnits = useMemo(() => filterValidUnits(units), [units]);

  const handlers = useMemo<EvidenceHandlers>(
    () => ({
      onUrlChange: handleUrlChange,
      onRemove: handleRemove,
      onSubmit: (evidence: EvidenceType) => {
        void handleSubmit(evidence);
      },
      onDelete: (evidence: EvidenceType) => {
        void handleDelete(evidence);
      },
    }),
    [handleUrlChange, handleRemove, handleSubmit, handleDelete]
  );

  if (filteredUnits.length === 0) {
    return <EmptyTpqiSection />;
  }

  return (
    <section>
      <DecorativeBackground />
      <ErrorBoundary>
        <LoadingStates evidenceLoading={evidenceLoading} evidenceError={evidenceError} />

        <UnitsList filteredUnits={filteredUnits} evidenceState={evidenceState} handlers={handlers} />
      </ErrorBoundary>
    </section>
  );
});

TpqiSkillKnowledgeItems.displayName = "TpqiSkillKnowledgeItems";

const LoadingStates: React.FC<{
  evidenceLoading: boolean;
  evidenceError: string | null;
}> = memo(({ evidenceLoading, evidenceError }) => (
  <>
    {evidenceLoading && (
      <div className="flex items-center justify-center gap-2 py-4" aria-live="polite">
        <FaSpinner className="w-4 h-4 text-green-600 animate-spin" />
        <span className="text-green-600">Loading existing evidence...</span>
      </div>
    )}
    {evidenceError && evidenceError !== "Unauthorized: No token provided" && (
      <div className="flex items-center justify-center gap-2 py-4 text-red-600 bg-red-50 border border-red-200 rounded-lg mx-4" role="alert" aria-live="assertive">
        <FaExclamationTriangle className="w-4 h-4" />
        <span>Failed to load evidence: {evidenceError}</span>
      </div>
    )}
  </>
));
LoadingStates.displayName = "LoadingStates";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("TpqiSkillKnowledgeItems Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8" role="alert">
          <p className="text-red-500 text-lg">Something went wrong while loading TPQI units.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const EmptyTpqiSection: React.FC = memo(() => (
  <section
    className="relative bg-gradient-to-b from-green-50 via-white to-green-25 backdrop-blur-xl rounded-3xl p-8 border border-green-100 shadow-lg overflow-hidden"
    aria-labelledby="tpqi-units-heading"
  >
    <div className="text-center py-12">
      <FaCertificate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg font-medium mb-2">No TPQI Units Available</p>
      <p className="text-gray-400 text-sm">This competency doesn't have any TPQI unit information at the moment.</p>
    </div>
  </section>
));
EmptyTpqiSection.displayName = "EmptyTpqiSection";

const DecorativeBackground: React.FC = memo(() => (
  <>
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" aria-hidden="true" />
  </>
));
DecorativeBackground.displayName = "DecorativeBackground";

const UnitsList: React.FC<UnitsListProps> = memo(({ filteredUnits, evidenceState, handlers }) => (
  <ul className="flex flex-col gap-8">
    {filteredUnits.map((unit) => (
      <Unit key={unit.id} unit={unit} evidenceState={evidenceState} handlers={handlers} />
    ))}
  </ul>
));
UnitsList.displayName = "UnitsList";

const Unit: React.FC<UnitProps> = memo(({ unit, evidenceState, handlers }) => {
  const filteredSkills = useMemo(() => filterValidSkills(unit.skills), [unit.skills]);
  const filteredKnowledge = useMemo(() => filterValidKnowledge(unit.knowledge), [unit.knowledge]);

  if (filteredSkills.length === 0 && filteredKnowledge.length === 0) return null;

  return (
    <li className="mb-8 last:mb-0">
      <div className="flex flex-col p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="space-y-10">
          {filteredSkills.length > 0 && <SkillsList skills={filteredSkills} evidenceState={evidenceState} handlers={handlers} />}

          {filteredKnowledge.length > 0 && <KnowledgeList knowledge={filteredKnowledge} evidenceState={evidenceState} handlers={handlers} />}
        </div>
      </div>
    </li>
  );
});
Unit.displayName = "Unit";

const SkillsList: React.FC<SkillsListProps> = memo(({ skills, evidenceState, handlers }) => {
  const handleUrlChange = useCallback((skillId: number) => (value: string) => handlers.onUrlChange({ type: "skill", id: skillId }, value), [handlers]);
  const handleRemove = useCallback((skillId: number) => () => handlers.onRemove({ type: "skill", id: skillId }), [handlers]);
  const handleSubmit = useCallback((skillId: number) => () => handlers.onSubmit({ type: "skill", id: skillId }), [handlers]);
  const handleDelete = useCallback((skillId: number) => () => handlers.onDelete({ type: "skill", id: skillId }), [handlers]);

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-4 flex items-center">
        <FaCertificate className="w-4 h-4 mr-2 text-green-600" />
        Skills ({skills.length})
      </h4>
      <ul className="space-y-6">
        {skills.map((skill) => {
          const key = `skill-${skill.id}`;
          const isSubmitted = evidenceState.submitted[key] || false;
          const isLoading = evidenceState.loading[key] || false;
          const isDeleting = evidenceState.deleting[key] || false;
          const error = evidenceState.errors[key] || "";
          const url = evidenceState.urls[key] || "";
          const approvalStatus = evidenceState.approvalStatus[key] || "PENDING";

          return (
            <EvidenceItem
              key={skill.id}
              id={`skill-${skill.id}`}
              text={skill.skill_name}
              url={url}
              approvalStatus={approvalStatus}
              submitted={isSubmitted}
              loading={isLoading}
              deleting={isDeleting}
              error={error}
              colorVariant="blue"
              placeholder="Enter skill evidence URL"
              onUrlChange={handleUrlChange(skill.id)}
              onRemove={handleRemove(skill.id)}
              onSubmit={handleSubmit(skill.id)}
              onDelete={handleDelete(skill.id)}
            />
          );
        })}
      </ul>
    </div>
  );
});
SkillsList.displayName = "SkillsList";

const KnowledgeList: React.FC<KnowledgeListProps> = memo(({ knowledge, evidenceState, handlers }) => {
  const handleUrlChange = useCallback((knowledgeId: number) => (value: string) => handlers.onUrlChange({ type: "knowledge", id: knowledgeId }, value), [handlers]);
  const handleRemove = useCallback((knowledgeId: number) => () => handlers.onRemove({ type: "knowledge", id: knowledgeId }), [handlers]);
  const handleSubmit = useCallback((knowledgeId: number) => () => handlers.onSubmit({ type: "knowledge", id: knowledgeId }), [handlers]);
  const handleDelete = useCallback((knowledgeId: number) => () => handlers.onDelete({ type: "knowledge", id: knowledgeId }), [handlers]);

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-4 flex items-center">
        <FaCertificate className="w-4 h-4 mr-2 text-green-600" />
        Knowledge ({knowledge.length})
      </h4>
      <ul className="space-y-6">
        {knowledge.map((item) => {
          const key = `knowledge-${item.id}`;
          const isSubmitted = evidenceState.submitted[key] || false;
          const isLoading = evidenceState.loading[key] || false;
          const isDeleting = evidenceState.deleting[key] || false;
          const error = evidenceState.errors[key] || "";
          const url = evidenceState.urls[key] || "";
          const approvalStatus = evidenceState.approvalStatus[key] || "PENDING";

          return (
            <EvidenceItem
              key={item.id}
              id={`knowledge-${item.id}`}
              text={item.knowledge_name}
              url={url}
              approvalStatus={approvalStatus}
              submitted={isSubmitted}
              loading={isLoading}
              deleting={isDeleting}
              error={error}
              colorVariant="purple"
              placeholder="Enter knowledge evidence URL"
              onUrlChange={handleUrlChange(item.id)}
              onRemove={handleRemove(item.id)}
              onSubmit={handleSubmit(item.id)}
              onDelete={handleDelete(item.id)}
            />
          );
        })}
      </ul>
    </div>
  );
});
KnowledgeList.displayName = "KnowledgeList";

export default TpqiSkillKnowledgeItems;
