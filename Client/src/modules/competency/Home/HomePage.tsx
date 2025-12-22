import React from "react";
import Layout from "@Layouts/Layout";
import { HomeHeroSection } from "./component/HomeHeroSection";
import { CompetencyInfoSection } from "./component/CompetencyInfoSection";
import { WhatsNewsSection } from "./component/WhatsNewsSection";
import { UsageGuideSection } from "./component/UsageGuideSection";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

/**
 * HomePage
 *
 * Renders the main landing page with a shared background, hero section, and news section.
 */
const HomePage: React.FC = () => (
  <Layout>
    <WhiteTealBackground>
      <HomeHeroSection />
      <UsageGuideSection />
      <CompetencyInfoSection />
      <WhatsNewsSection />
    </WhiteTealBackground>
  </Layout>
);

export default HomePage;
