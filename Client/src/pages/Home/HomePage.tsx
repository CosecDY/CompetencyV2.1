import React from "react";
import Layout from "@Layouts/Layout";
import { HomeHeroSection } from "./components/HomeHeroSection";

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-red">
        <HomeHeroSection />
      </div>
    </Layout>
  );
};

export default HomePage;
