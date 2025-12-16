import React from "react";
import { advisorInfo } from "../../data/advisorData";
import { useInView } from "../../hooks/useInView";
import { AdvisorHeader } from "./AdvisorHeader";
import { AdvisorCard } from "./AdvisorCard";

const AdvisorSection: React.FC = () => {
  const [headerRef, headerInView] = useInView(0.1);
  const [cardRef, cardInView] = useInView(0.1);

  return (
    <section
      id="advisor-section"
      className="relative min-h-screen flex flex-col items-center justify-center w-full py-20 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
        <AdvisorHeader headerRef={headerRef} headerInView={headerInView} />

        <AdvisorCard
          advisor={advisorInfo}
          cardRef={cardRef}
          cardInView={cardInView}
        />
      </div>
    </section>
  );
};

export default AdvisorSection;
