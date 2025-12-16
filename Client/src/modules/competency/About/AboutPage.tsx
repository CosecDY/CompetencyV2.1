import Layout from "@Layouts/Layout";
import AboutBannerSection from "./components/AboutBannerSection/AboutBannerSection";
import TeamMember from "./components/TeamSection/TeamSection";
import AdvisorSection from "./components/AdvisorSection/AdvisorSection";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <WhiteTealBackground>
        <AboutBannerSection />
        <TeamMember />
        <AdvisorSection />
      </WhiteTealBackground>
    </Layout>
  );
};

export default AboutPage;
