import React from "react";
import Layout from "@Layouts/Layout";
import { HomeHeroSection } from "./component/HomeHeroSection";
import { WhatsNewsSection } from "./component/WhatsNewsSection";
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
      <WhatsNewsSection />
    </WhiteTealBackground>
  </Layout>
);

export default HomePage;
