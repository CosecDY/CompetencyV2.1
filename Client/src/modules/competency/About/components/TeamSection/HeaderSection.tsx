import React, { useEffect, useRef, useState } from "react";

export const HeaderSection: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerInView, setHeaderInView] = useState(false);

  useEffect(() => {
    const node = headerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className={`text-center mb-16 transform transition-all duration-1000 ${
        headerInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent py-6 tracking-tight">
        ทีมผู้พัฒนา
      </h1>

      <div
        className={`w-12 h-px bg-teal-400 mx-auto mb-8 transform transition-all duration-800 ${
          headerInView ? "scale-x-100" : "scale-x-0"
        }`}
        style={{ transitionDelay: headerInView ? "400ms" : "0ms" }}
      />

      <p
        className={`text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium transform transition-all duration-800 ${
          headerInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: headerInView ? "600ms" : "0ms" }}
      >
        ข้อมูลทีมผู้พัฒนาและผู้มีส่วนร่วมในโครงการนี้
      </p>
    </div>
  );
};
