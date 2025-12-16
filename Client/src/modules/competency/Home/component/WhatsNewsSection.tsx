import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Database,
  Server,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

/**
 * Renders the "What's New in Version 2" section, showcasing the latest features and improvements.
 * This section includes animated feature cards and a summary call-to-action.
 *
 * ## Features
 * - Intersection Observer for scroll-triggered animations
 * - Three feature cards with icons and detailed descriptions
 * - Animated arrows connecting features
 * - Summary section with call-to-action button
 * - Smooth scroll functionality back to hero section
 * - Responsive design with Tailwind CSS
 *
 * @component
 * @returns {JSX.Element} The rendered What's New section
 */

export const WhatsNewsSection = () => {
  const [inView, setInView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("version-2-features");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30, x: -20 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: RefreshCw,
      title: "การผสานกรอบสมรรถนะอย่างไร้รอยต่อ",
      description:
        "รวมโครงการ SFIA และ TPQI ไว้ในแพลตฟอร์มเดียว ช่วยให้สามารถประเมินสมรรถนะจากทั้งสองกรอบได้พร้อมกันอย่างมีประสิทธิภาพ",
    },
    {
      icon: Database,
      title: "สร้างฐานข้อมูลใหม่ทั้งหมด",
      description:
        "พัฒนาฐานข้อมูลใหม่ตั้งแต่ต้น พร้อมข้อมูลที่ครบถ้วน อัปเดต SFIA เป็นเวอร์ชัน 7 เพิ่มความแม่นยำและการจับคู่สมรรถนะที่ครอบคลุม",
    },
    {
      icon: Server,
      title: "สถาปัตยกรรมเซิร์ฟเวอร์แบบโมดูลาร์",
      description:
        "ปรับปรุงจากโค้ดไฟล์เดียวขนาดกว่า 1,000 บรรทัด สู่โครงสร้างแบบ Router ที่เป็นระเบียบ ดูแลรักษาง่าย และรองรับการขยายตัวในอนาคต",
    },
  ];

  const navigateToResults = () => {
    navigate("/results");
  };

  return (
    <section
      id="version-2-features"
      className="relative z-30 py-20 bg-gradient-to-b from-white via-teal-50 to-teal-100 overflow-hidden"
      style={{
        marginTop: "-2px", // This removes any gap between sections
        background:
          "linear-gradient(to bottom, rgb(255 255 255), rgb(240 253 250), rgb(204 251 241))",
      }}
    >
      <div className="relative z-40 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-teal-100/80 backdrop-blur-sm text-teal-800 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-200/50">
            <CheckCircle className="w-4 h-4" />
            เวอร์ชัน 2.0 เปิดตัวแล้ว
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent mb-4 pt-7">
            มีอะไรใหม่ในเวอร์ชัน 2
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            การปรับปรุงครั้งใหญ่และฟีเจอร์ใหม่ที่ทำให้การประเมินสมรรถนะมีประสิทธิภาพ
            <br />
            และครอบคลุมมากกว่าที่เคย
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="relative group"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100/50 group-hover:border-teal-200 h-full hover:bg-white">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Animated arrow pointing to next feature */}
                {index < features.length - 1 && (
                  <motion.div
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:block"
                    initial={{ opacity: 0, x: -10 }}
                    animate={
                      inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                    }
                    transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                    >
                      <ArrowRight className="w-6 h-6 text-teal-400" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-teal-50/80 to-teal-100/80 backdrop-blur-sm rounded-2xl p-8 border border-teal-200/50 shadow-lg">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-800 to-teal-900 bg-clip-text text-transparent mb-4">
              พร้อมจะสัมผัสประสบการณ์ใหม่แล้วหรือยัง?
            </h3>
            <p className="text-teal-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              เวอร์ชัน 2 คือการยกระดับแพลตฟอร์มประเมินสมรรถนะอย่างสมบูรณ์แบบ{" "}
              <br />
              ด้วยการรวมกรอบสมรรถนะที่หลากหลาย ฐานข้อมูลที่ครอบคลุม
              และสถาปัตยกรรมที่ทันสมัย <br />
              คุณจึงมีเครื่องมือที่ทรงพลังที่สุดสำหรับการประเมินสมรรถนะอยู่ในมือ
            </p>
            <motion.button
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-3 rounded-xl font-medium hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={navigateToResults}
            >
              Start Exploring Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
