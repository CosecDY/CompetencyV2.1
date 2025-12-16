import React from "react";

interface AdvisorHeaderProps {
  headerRef: React.RefObject<HTMLDivElement | null>;
  headerInView: boolean;
}

export const AdvisorHeader: React.FC<AdvisorHeaderProps> = ({
  headerRef,
  headerInView,
}) => {
  return (
    <div
      ref={headerRef}
      className={`text-center mb-16 transform transition-all duration-1000 ${
        headerInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent py-6 tracking-tight">
        อาจารย์ที่ปรึกษา
      </h1>
      <div
        className={`w-12 h-px bg-teal-400 mx-auto mb-8 transform transition-all duration-800 ${
          headerInView ? "scale-x-100" : "scale-x-0"
        }`}
        style={{ transitionDelay: headerInView ? "400ms" : "0ms" }}
      />
    </div>
  );
};
