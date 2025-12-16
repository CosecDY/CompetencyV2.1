import React, { useEffect, useState } from "react";
import AboutHeader from "./AboutHeader";
import StandardsSection from "./StandardsSection";
import PurposeSection from "./PurposeSection";
import FeaturesSection from "./FeaturesSection";

const AboutBannerSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="about-section"
      className="relative min-h-screen flex flex-col items-center justify-center w-full pt-20 overflow-hidden mt-10"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
        <AboutHeader isVisible={isVisible} />
        <StandardsSection isVisible={isVisible} />
        <PurposeSection isVisible={isVisible} />
        <FeaturesSection isVisible={isVisible} />
      </div>
    </section>
  );
};

export default AboutBannerSection;
