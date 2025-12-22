import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Award, Globe, Search } from "lucide-react";

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
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${framework.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <framework.icon className="w-6 h-6 text-white" />
      </div>
      <div className={`inline-block bg-gradient-to-r ${framework.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-3`}>{framework.framework}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{framework.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{framework.description}</p>
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
    </motion.div>
  );
}

export const HomeHeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (term: string) => {
      if (term.trim() !== "") {
        navigate(`/search-career?q=${encodeURIComponent(term.trim())}`);
      }
    },
    [navigate]
  );

  const scrollToUsageGuide = useCallback(() => {
    document.getElementById("usage-guide")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <section id="home-hero" className="relative min-h-screen flex flex-col items-center justify-center pb-16 overflow-hidden">
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex-1 flex flex-col justify-center w-full">
        {/* Animated Title */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="text-4xl md:text-7xl font-bold text-slate-800 pb-6 flex flex-col md:block items-center justify-center gap-2"
        >
          <span>ค้นหาอาชีพและทักษะ</span>
          <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent relative inline-block">สมรรถนะ</span>
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed font-medium max-w-3xl mx-auto"
        >
          ฐานข้อมูลมาตรฐานสมรรถนะบุคลากร (Competency Database) <br className="hidden md:block" />
          ครอบคลุมมาตรฐานสากล <span className="font-bold text-blue-600">SFIA</span> และ <span className="font-bold text-emerald-600">TPQI</span>
        </motion.p>

        {/* --- PREMIUM SEARCH BOX --- */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="relative w-full max-w-3xl mx-auto">
          <div className="relative group z-20">
            {/* Glow Effect Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>

            {/* Input Container */}
            <div className="relative bg-white rounded-full shadow-xl flex items-center p-2 border border-slate-200 transition-transform duration-300 focus-within:scale-[1.02]">
              {/* Search Icon */}
              <div className="pl-6 pr-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                <Search className="w-7 h-7" />
              </div>

              {/* Input Field */}
              <input
                type="text"
                className="flex-1 w-full py-4 text-xl text-slate-700 bg-transparent outline-none placeholder:text-slate-400 font-medium"
                placeholder="ค้นหาอาชีพ (เช่น System Analyst) หรือทักษะ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
              />

              {/* Search Button */}
              <button
                onClick={() => handleSearch(searchTerm)}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white text-lg font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>ค้นหา</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Framework Showcase Cards */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-20 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {frameworkFeatures.map((framework, index) => (
            <FrameworkCard key={framework.framework} framework={framework} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button onClick={scrollToUsageGuide} className="flex flex-col items-center text-teal-600/70 hover:text-teal-700 transition-colors group" aria-label="Scroll to usage guide">
          <span className="text-sm font-medium mb-2">วิธีการใช้งาน</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
};
