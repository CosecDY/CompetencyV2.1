// components/AdvisorProfile.tsx
import React from "react";

interface AdvisorProfileProps {
  name: string;
  englishName: string;
  image: string;
  cardInView: boolean;
}

export const AdvisorProfile: React.FC<AdvisorProfileProps> = ({
  name,
  englishName,
  image,
  cardInView,
}) => {
  return (
    <>
      {/* Profile Image */}
      <div
        className={`transform transition-all duration-500 ${
          cardInView ? "scale-100 rotate-0" : "scale-0 rotate-12"
        }`}
        style={{
          transitionDelay: cardInView ? "400ms" : "0ms",
        }}
      >
        <img
          src={image}
          alt={name}
          className="w-48 h-48 rounded-full object-cover mb-6 border-4 border-teal-400 shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Name and Title */}
      <div
        className={`transform transition-all duration-500 mb-8 ${
          cardInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{
          transitionDelay: cardInView ? "600ms" : "0ms",
        }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-teal-800 transition-colors">
          {name}
        </h2>
        <p className="text-xl text-teal-600 font-medium">{englishName}</p>
      </div>
    </>
  );
};
