import React from "react";
import { SocialLink } from "../../types/advisor.types";

interface AdvisorSocialLinksProps {
  socialLinks: SocialLink[];
  cardInView: boolean;
}

export const AdvisorSocialLinks: React.FC<AdvisorSocialLinksProps> = ({
  socialLinks,
  cardInView,
}) => {
  return (
    <div
      className={`flex justify-center gap-4 mt-8 transform transition-all duration-500 ${
        cardInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{
        transitionDelay: cardInView ? "1200ms" : "0ms",
      }}
    >
      {socialLinks.map((social) => (
        <SocialLinkButton
          key={social.url}
          url={social.url}
          icon={social.icon}
          label={social.label}
        />
      ))}
    </div>
  );
};

interface SocialLinkButtonProps {
  url: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLinkButton: React.FC<SocialLinkButtonProps> = ({
  url,
  icon,
  label,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 hover:text-teal-800 transition-all duration-300 hover:scale-110"
      aria-label={label}
    >
      {icon}
    </a>
  );
};
