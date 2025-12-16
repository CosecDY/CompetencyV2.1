import React, { useMemo, useEffect, useCallback, memo } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { useSfiaEvidenceSender } from "../../hooks/evidence/useSfiaEvidenceSender";
import { useEvidenceFetcher } from "../../hooks/evidence";
import { SfiaLevel, SfiaDescription, SfiaSubSkill, EvidenceState } from "../../types/sfia";
import { filterValidLevels, hasValidContent, countSubskills } from "../../utils/sfiaUtils";
import SubSkillItem from "./sfiaSubSkillItem";

// Types
interface SfiaSkillLevelsProps {
  levels: SfiaLevel[];
  skillCode: string;
}

interface EvidenceHandlers {
  onUrlChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  onSubmit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface SkillLevelsListProps {
  filteredLevels: SfiaLevel[];
  skillCode: string;
  evidenceState: EvidenceState;
  handlers: EvidenceHandlers;
}

interface SkillLevelProps {
  level: SfiaLevel;
  index: number;
  skillCode: string;
  evidenceState: EvidenceState;
  handlers: EvidenceHandlers;
}

interface DescriptionsListProps {
  descriptions: SfiaDescription[];
  skillCode: string;
  evidenceState: EvidenceState;
  handlers: EvidenceHandlers;
}

interface SubSkillsSectionProps {
  subskills: SfiaSubSkill[];
  skillCode: string;
  evidenceState: EvidenceState;
  handlers: EvidenceHandlers;
}

const SfiaSkillLevels: React.FC<SfiaSkillLevelsProps> = memo(({ levels, skillCode }) => {
  const { evidenceState, handleUrlChange, handleRemove, handleSubmit, handleDelete, initializeEvidenceUrls } = useSfiaEvidenceSender();

  const { evidenceData, loading: evidenceLoading, error: evidenceError } = useEvidenceFetcher(skillCode);

  useEffect(() => {
    if (evidenceData && Object.keys(evidenceData).length > 0) {
      initializeEvidenceUrls(
        Object.fromEntries(
          Object.entries(evidenceData).map(([key, value]) => [
            key,
            {
              ...value,
              approvalStatus: value.approvalStatus ?? null,
            },
          ])
        )
      );
    }
  }, [evidenceData, initializeEvidenceUrls]);

  const filteredLevels = useMemo(() => filterValidLevels(levels), [levels]);

  const handlers = useMemo<EvidenceHandlers>(
    () => ({
      onUrlChange: handleUrlChange,
      onRemove: handleRemove,
      onSubmit: (id: number) => {
        void handleSubmit(id);
      },
      onDelete: (id: number) => {
        void handleDelete(id);
      },
    }),
    [handleUrlChange, handleRemove, handleSubmit, handleDelete]
  );

  if (filteredLevels.length === 0) {
    return <EmptySkillLevelsSection />;
  }

  return (
    <section
      className="relative bg-gradient-to-b from-blue-50 via-white to-blue-25 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-lg overflow-hidden"
      aria-labelledby="skill-levels-heading"
    >
      <DecorativeBackground />
      <SectionHeader />

      <ErrorBoundary>
        <LoadingStates evidenceLoading={evidenceLoading} evidenceError={evidenceError} />

        <SkillLevelsList filteredLevels={filteredLevels} skillCode={skillCode} evidenceState={evidenceState} handlers={handlers} />
      </ErrorBoundary>
    </section>
  );
});

SfiaSkillLevels.displayName = "SfiaSkillLevels";

const LoadingStates: React.FC<{
  evidenceLoading: boolean;
  evidenceError: string | null;
}> = memo(({ evidenceLoading, evidenceError }) => (
  <>
    {evidenceLoading && (
      <output className="text-center py-4" aria-live="polite">
        <span className="text-blue-600">🔄 Loading existing evidence...</span>
      </output>
    )}
    {evidenceError && evidenceError !== "Unauthorized: No token provided" && (
      <div className="text-center py-4" role="alert" aria-live="assertive">
        <span className="text-red-600">⚠️ Failed to load evidence: {evidenceError}</span>
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
    console.error("SfiaSkillLevels Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8" role="alert">
          <p className="text-red-500 text-lg">Something went wrong while loading skill levels.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const EmptySkillLevelsSection: React.FC = memo(() => (
  <section
    className="relative bg-gradient-to-b from-blue-50 via-white to-blue-25 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-lg overflow-hidden"
    aria-labelledby="skill-levels-heading"
  >
    <SectionHeader />
    <div className="text-center py-8">
      <p className="text-gray-500 text-lg">No skill level information available for this competency.</p>
    </div>
  </section>
));
EmptySkillLevelsSection.displayName = "EmptySkillLevelsSection";

const SectionHeader: React.FC = memo(() => (
  <h2 id="skill-levels-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
    <FaGraduationCap className="w-6 h-6 mr-3 text-blue-600" aria-hidden="true" />
    Skill Levels
  </h2>
));
SectionHeader.displayName = "SectionHeader";

const DecorativeBackground: React.FC = memo(() => (
  <>
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" aria-hidden="true" />
  </>
));
DecorativeBackground.displayName = "DecorativeBackground";

const SkillLevelsList: React.FC<SkillLevelsListProps> = memo(({ filteredLevels, skillCode, evidenceState, handlers }) => (
  <ul className="flex flex-col gap-6">
    {filteredLevels.map((level, index) => (
      <SkillLevel key={level.id} level={level} index={index} skillCode={skillCode} evidenceState={evidenceState} handlers={handlers} />
    ))}
  </ul>
));
SkillLevelsList.displayName = "SkillLevelsList";

const SkillLevel: React.FC<SkillLevelProps> = memo(({ level, index, skillCode, evidenceState, handlers }) => {
  const filteredDescriptions = useMemo(() => level.descriptions.filter(hasValidContent), [level.descriptions]);
  const totalSubskills = useMemo(() => countSubskills(filteredDescriptions), [filteredDescriptions]);
  const levelName = useMemo(() => (level.level_name ? `Level ${level.level_name}` : `Level ${index + 1}`), [level.level_name, index]);
  if (filteredDescriptions.length === 0) return null;
  return (
    <li className="mb-8">
      <div className="flex flex-col p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-200 gap-2 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <SkillLevelHeader levelName={levelName} totalSubskills={totalSubskills} />
        <DescriptionsList descriptions={filteredDescriptions} skillCode={skillCode} evidenceState={evidenceState} handlers={handlers} />
      </div>
    </li>
  );
});
SkillLevel.displayName = "SkillLevel";

const SkillLevelHeader: React.FC<{
  levelName: string;
  totalSubskills: number;
}> = memo(({ levelName, totalSubskills }) => (
  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center justify-between">
    <span>{levelName}</span>
    {totalSubskills > 0 && (
      <span className="text-sm font-normal text-blue-600 bg-blue-100 px-3 py-1 rounded-full" aria-label={`${totalSubskills} subskill${totalSubskills !== 1 ? "s" : ""}`}>
        {totalSubskills} subskill{totalSubskills !== 1 ? "s" : ""}
      </span>
    )}
  </h3>
));
SkillLevelHeader.displayName = "SkillLevelHeader";

const DescriptionsList: React.FC<DescriptionsListProps> = memo(({ descriptions, skillCode, evidenceState, handlers }) => (
  <>
    {descriptions.map((desc) => (
      <div key={desc.id} className="mb-4">
        {desc.description_text?.trim() && <p className="text-gray-700 leading-relaxed mb-3">{desc.description_text}</p>}
        {desc.subskills && desc.subskills.length > 0 && <SubSkillsSection subskills={desc.subskills} skillCode={skillCode} evidenceState={evidenceState} handlers={handlers} />}
      </div>
    ))}
  </>
));
DescriptionsList.displayName = "DescriptionsList";

const SubSkillsSection: React.FC<SubSkillsSectionProps> = memo(({ subskills, skillCode, evidenceState, handlers }) => {
  const validSubskills = useMemo(() => subskills.filter((subskill) => subskill.subskill_text?.trim()), [subskills]);
  const handleUrlChange = useCallback((subskillId: number) => (value: string) => handlers.onUrlChange(subskillId, value), [handlers]);
  const handleRemove = useCallback((subskillId: number) => () => handlers.onRemove(subskillId), [handlers]);
  const handleSubmit = useCallback((subskillId: number) => () => handlers.onSubmit(subskillId), [handlers]);
  const handleDelete = useCallback(
    (subskillId: number) => () => {
      handlers.onDelete(subskillId);
    },
    [handlers]
  );
  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-2">SubSkills:</h4>
      <ul className="space-y-4">
        {validSubskills.map((subskill) => {
          const idStr = subskill.id.toString();
          const evidenceUrl = evidenceState.urls[idStr];
          return (
            <SubSkillItem
              key={subskill.id}
              subskill={subskill}
              skillCode={skillCode}
              url={typeof evidenceUrl === "string" ? evidenceUrl : evidenceUrl?.evidenceUrl || ""}
              approvalStatus={evidenceUrl?.approvalStatus || "NOT_APPROVED"}
              submitted={evidenceState.submitted[idStr] || false}
              loading={evidenceState.loading[idStr] || false}
              deleting={evidenceState.deleting[idStr] || false}
              error={evidenceState.errors[idStr] || ""}
              onUrlChange={handleUrlChange(subskill.id)}
              onRemove={handleRemove(subskill.id)}
              onSubmit={handleSubmit(subskill.id)}
              onDelete={handleDelete(subskill.id)}
            />
          );
        })}
      </ul>
    </div>
  );
});
SubSkillsSection.displayName = "SubSkillsSection";

export default SfiaSkillLevels;
