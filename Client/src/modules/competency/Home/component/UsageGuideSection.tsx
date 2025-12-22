import React from "react";
import { motion } from "framer-motion";
import { Search, ListFilter, FileText, CheckCircle, FolderPlus } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "ค้นหาอาชีพ",
    description: "พิมพ์ชื่อตำแหน่งงาน หรือทักษะที่คุณสนใจในช่องค้นหา ระบบรองรับทั้งภาษาไทยและอังกฤษ",
    icon: Search,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "เลือกมาตรฐาน",
    description: "ผลลัพธ์จะแสดงสมรรถนะจากมาตรฐาน SFIA (สากล) และ TPQI (ไทย) เปรียบเทียบให้เห็นชัดเจน",
    icon: ListFilter,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 3,
    title: "ดูรายละเอียด",
    description: "คลิกเพื่อดูคำอธิบายระดับความสามารถ (Level) และเกณฑ์การประเมินของแต่ละทักษะ",
    icon: FileText,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 4,
    title: "ประเมินตนเอง",
    description: "บันทึกหลักฐาน (Evidence) และประเมินระดับความสามารถของคุณในแต่ละทักษะ",
    icon: CheckCircle,
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: 5,
    title: "สร้าง Portfolio",
    description: "รวบรวมผลการประเมินและหลักฐานต่างๆ จัดทำเป็น Portfolio เพื่อนำเสนอผลงาน",
    icon: FolderPlus,
    color: "bg-rose-100 text-rose-600",
  },
];

export const UsageGuideSection: React.FC = () => {
  return (
    <section id="usage-guide" className="py-20 bg-white/50 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {" "}
        {/* Increased max-width for 5 items */}
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            วิธีการใช้งานระบบ
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg text-gray-600 max-w-2xl mx-auto">
            เริ่มต้นใช้งานง่ายๆ 5 ขั้นตอน เพื่อค้นหา พัฒนา และนำเสนอสมรรถนะของคุณ
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
          {/* Connecting Line (Desktop only - hidden on smaller screens) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div
                className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10 bg-white border-4 border-white`}
              >
                <step.icon className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">{step.id}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
