import React from "react";
import { AdvisorInfo } from "../../types/advisor.types";
import { AdvisorProfile } from "./AdvisorProfile";
import { AdvisorAffiliations } from "./AdvisorAffiliations";
import { AdvisorContact } from "./AdvisorContact";
import { AdvisorSocialLinks } from "./AdvisorSocialLinks";

interface AdvisorCardProps {
  advisor: AdvisorInfo;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardInView: boolean;
}

export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  advisor,
  cardRef,
  cardInView,
}) => {
  return (
    <div
      ref={cardRef}
      className={`border border-teal-200 rounded-2xl p-8 hover:shadow-xl hover:border-teal-300 transition-all duration-700 group transform ${
        cardInView
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-8 opacity-0 scale-95"
      }`}
      style={{
        transitionDelay: cardInView ? "200ms" : "0ms",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <AdvisorProfile
          name={advisor.name}
          englishName={advisor.englishName}
          image={advisor.image}
          cardInView={cardInView}
        />

        <AdvisorAffiliations
          affiliations={advisor.affiliations}
          cardInView={cardInView}
        />

        {/* Divider */}
        <div className="w-full h-px bg-teal-200 mb-8" />

        <AdvisorContact contact={advisor.contact} cardInView={cardInView} />

        <AdvisorSocialLinks
          socialLinks={advisor.socialLinks}
          cardInView={cardInView}
        />
      </div>
    </div>
  );
};
