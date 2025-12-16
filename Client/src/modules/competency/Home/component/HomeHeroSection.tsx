import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Award, Layers, Globe } from "lucide-react";
import SearchBox from "@Components/Competency/SearchBox";

/** Animation variants for Framer Motion */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.6,
    },
  },
};

const frameworkCardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * Data for framework showcase cards.
 * Each object represents a framework and its display properties.
 */
const frameworkFeatures = [
  {
    framework: "SFIA",
    title: "Skills Framework for the Information Age",
    description: "มาตรฐานสมรรถนะด้านเทคโนโลยีสารสนเทศระดับโลก",
    color: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Globe,
    features: ["7 หมวดหลัก 102 สกิล", "7 ระดับความเชี่ยวชาญ", "มาตรฐานสากล"],
  },
  {
    framework: "TPQI",
    title: "Thailand Professional Qualification Institute",
    description: "มาตรฐานคุณวุฒิวิชาชีพไทย สำหรับบุคลากร ICT",
    color: "from-emerald-500 to-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Award,
    features: ["8 สาขาอาชีพหลัก", "5 ระดับความสามารถ", "มาตรฐานไทย"],
  },
];

/**
 * Renders a single framework showcase card with animation.
 * @param framework - Framework data object
 * @param index - Index of the card for animation delay
 */
function FrameworkCard({
  framework,
  index,
}: Readonly<{
  framework: (typeof frameworkFeatures)[0];
  index: number;
}>) {
  return (
    <motion.div
      variants={frameworkCardVariants}
      className={`relative ${framework.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 ${framework.borderColor} border-2 group hover:scale-105`}
    >
      {/* Framework Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${framework.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <framework.icon className="w-6 h-6 text-white" />
      </div>
      {/* Framework Badge */}
      <div className={`inline-block bg-gradient-to-r ${framework.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-3`}>{framework.framework}</div>
      {/* Framework Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">{framework.title}</h3>
      {/* Framework Description */}
      <p className="text-gray-600 text-sm mb-4">{framework.description}</p>
      {/* Framework Features List */}
      <div className="space-y-2">
        {framework.features.map((feature, featureIndex) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.8 + index * 0.2 + featureIndex * 0.1,
            }}
            className="flex items-center gap-2 text-gray-700"
          >
            <div className={`w-2 h-2 bg-gradient-to-r ${framework.color} rounded-full`} />
            <span className="text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>
      {/* Decorative corner element */}
      <div className={`absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br ${framework.color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
    </motion.div>
  );
}

/**
 * HomeHeroSection
 *
 * Renders the hero section for the Home page, including:
 * - Animated title and subtitle
 * - Search box for competencies
 * - Animated framework showcase cards (SFIA & TPQI)
 * - Scroll indicator to new features section
 */
export const HomeHeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  /**
   * Handles search action from the search box.
   * Navigates to the results page with the search query.
   */
  const handleSearch = useCallback(
    (term: string) => {
      if (term.trim() !== "") {
        navigate(`/results?query=${encodeURIComponent(term.trim())}`);
      }
    },
    [navigate]
  );

  /**
   * Scrolls smoothly to the "What's New" features section.
   */
  const scrollToNewFeatures = useCallback(() => {
    document.getElementById("version-2-features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <section id="home-hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex-1 flex flex-col justify-center">
        {/* Animated Title */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent pb-6"
        >
          Competency Database
        </motion.h1>
        {/* Animated Subtitle */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium"
        >
          ค้นหาและเปรียบเทียบกรอบสมรรถนะ SFIA & TPQI อย่างมีประสิทธิภาพ
        </motion.p>
        {/* Search Box */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="relative flex justify-center">
          <SearchBox searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearch={handleSearch} placeholder="ค้นหาสมรรถนะ..." variant="hero" />
        </motion.div>
        {/* Framework Showcase Cards */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {frameworkFeatures.map((framework, index) => (
            <FrameworkCard key={framework.framework} framework={framework} index={index} />
          ))}
        </motion.div>
      </div>
      {/* Scroll Indicator */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button onClick={scrollToNewFeatures} className="flex flex-col items-center text-teal-600 hover:text-teal-700 transition-colors group" aria-label="Scroll to see what's new">
          <span className="text-sm font-medium mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            What's New in Version 2
          </span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
};
