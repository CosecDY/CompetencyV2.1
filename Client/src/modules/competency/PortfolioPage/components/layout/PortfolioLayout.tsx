import React from "react";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

const PortfolioLayout: React.FC<PortfolioLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <WhiteTealBackground>
        <div className="min-h-screen py-16 sm:py-20">
          <div className="container mx-auto px-2 sm:px-0 md:px-6 lg:px-8">{children}</div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default PortfolioLayout;
