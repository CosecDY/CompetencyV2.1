// components/MemberCard.tsx
import React from "react";
import { MemberProps } from "../../types/team.types";
import { useInView } from "../../hooks/useInView";

interface MemberCardProps extends MemberProps {
  delay?: number;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  name,
  englishName,
  image,
  education,
  faculty,
  email,
  tel,
  delay = 0,
}) => {
  const [ref, isInView] = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`bg-white/90 backdrop-blur-sm border border-teal-200 rounded-2xl p-4 flex flex-col items-center hover:shadow-xl hover:border-teal-300 hover:bg-teal-50 transition-all duration-700 group h-full transform ${
        isInView
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-8 opacity-0 scale-95"
      }`}
      style={{
        transitionDelay: isInView ? `${delay}ms` : "0ms",
      }}
    >
      <MemberImage
        image={image}
        name={name}
        isInView={isInView}
        delay={delay}
      />

      <MemberName name={name} isInView={isInView} delay={delay} />

      <MemberEnglishName
        englishName={englishName}
        isInView={isInView}
        delay={delay}
      />

      <MemberEducation
        education={education}
        faculty={faculty}
        isInView={isInView}
        delay={delay}
      />

      <MemberContact
        email={email}
        tel={tel}
        isInView={isInView}
        delay={delay}
      />
    </div>
  );
};

// Sub-components for better organization
const MemberImage: React.FC<{
  image: string;
  name: string;
  isInView: boolean;
  delay: number;
}> = ({ image, name, isInView, delay }) => (
  <div
    className={`transform transition-all duration-500 ${
      isInView ? "scale-100 rotate-0" : "scale-0 rotate-12"
    }`}
    style={{
      transitionDelay: isInView ? `${delay + 200}ms` : "0ms",
    }}
  >
    <img
      src={image}
      alt={name}
      className="w-20 h-20 rounded-full object-cover mb-3 border-3 border-teal-400 shadow-lg group-hover:scale-105 transition-transform duration-300"
    />
  </div>
);

const MemberName: React.FC<{
  name: string;
  isInView: boolean;
  delay: number;
}> = ({ name, isInView, delay }) => (
  <div
    className={`transform transition-all duration-500 ${
      isInView ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
    }`}
    style={{
      transitionDelay: isInView ? `${delay + 300}ms` : "0ms",
    }}
  >
    <h3 className="text-base font-semibold text-gray-900 mb-1 text-center group-hover:text-teal-800 transition-colors">
      {name}
    </h3>
  </div>
);

const MemberEnglishName: React.FC<{
  englishName: string;
  isInView: boolean;
  delay: number;
}> = ({ englishName, isInView, delay }) => (
  <div
    className={`transform transition-all duration-500 ${
      isInView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
    }`}
    style={{
      transitionDelay: isInView ? `${delay + 400}ms` : "0ms",
    }}
  >
    <p className="text-sm text-teal-600 mb-2 text-center font-medium">
      {englishName}
    </p>
  </div>
);

const MemberEducation: React.FC<{
  education: string;
  faculty: string;
  isInView: boolean;
  delay: number;
}> = ({ education, faculty, isInView, delay }) => (
  <div
    className={`transform transition-all duration-500 ${
      isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}
    style={{
      transitionDelay: isInView ? `${delay + 500}ms` : "0ms",
    }}
  >
    <p className="text-gray-700 text-center text-sm mb-1 leading-snug">
      {education}
    </p>
    <p className="text-gray-700 text-center text-sm mb-3 leading-snug">
      {faculty}
    </p>
  </div>
);

const MemberContact: React.FC<{
  email?: string;
  tel: string;
  isInView: boolean;
  delay: number;
}> = ({ email, tel, isInView, delay }) => (
  <div
    className={`mt-auto space-y-0.5 transform transition-all duration-500 ${
      isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`}
    style={{
      transitionDelay: isInView ? `${delay + 600}ms` : "0ms",
    }}
  >
    {email && (
      <p className="text-gray-600 text-xs text-center">
        <span className="text-teal-600 font-medium">Email:</span> {email}
      </p>
    )}
    <p className="text-gray-600 text-xs text-center">
      <span className="text-teal-600 font-medium">Tel:</span> {tel}
    </p>
  </div>
);
