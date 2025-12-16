import React from "react";
import { ContactInfo } from "../../types/advisor.types";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
} from "react-icons/fa";

interface AdvisorContactProps {
  contact: ContactInfo;
  cardInView: boolean;
}

export const AdvisorContact: React.FC<AdvisorContactProps> = ({
  contact,
  cardInView,
}) => {
  return (
    <div
      className={`w-full transform transition-all duration-500 ${
        cardInView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
      style={{
        transitionDelay: cardInView ? "1000ms" : "0ms",
      }}
    >
      <h3 className="text-xl font-semibold text-teal-700 mb-6 text-center">
        ช่องทางการติดต่อ
      </h3>
      <div className="space-y-4">
        <ContactItem
          icon={
            <FaMapMarkerAlt className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
          }
          content={contact.address}
          isAddress
        />

        <ContactItem
          icon={<FaEnvelope className="w-5 h-5 text-teal-600 flex-shrink-0" />}
          content={contact.email}
        />

        <ContactItem
          icon={<FaPhoneAlt className="w-5 h-5 text-teal-600 flex-shrink-0" />}
          content={`Office: ${contact.officePhone} / Mobile: ${contact.mobilePhone}`}
        />

        <ContactItem
          icon={
            <FaCalendarAlt className="w-5 h-5 text-teal-600 flex-shrink-0" />
          }
          content="นัดหมาย (Appointment)"
          isLink
          url={contact.appointmentUrl}
        />
      </div>
    </div>
  );
};

interface ContactItemProps {
  icon: React.ReactNode;
  content: string;
  isAddress?: boolean;
  isLink?: boolean;
  url?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  content,
  isAddress = false,
  isLink = false,
  url,
}) => {
  const containerClass = `flex items-${
    isAddress ? "start" : "center"
  } gap-3 justify-center`;

  if (isLink && url) {
    return (
      <div className={containerClass}>
        {icon}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
        >
          {content}
        </a>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {icon}
      <p className={`text-gray-700 ${isAddress ? "" : "text-center"}`}>
        {content}
      </p>
    </div>
  );
};
