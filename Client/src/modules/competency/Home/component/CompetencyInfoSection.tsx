import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Heart, Zap } from "lucide-react";

const ksaData = [
  {
    title: "Knowledge (ความรู้)",
    description: "ความรู้ทางวิชาการ ทฤษฎี และหลักการต่างๆ ที่จำเป็นสำหรับการทำงาน",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    delay: 0.2,
  },
  {
    title: "Skills (ทักษะ)",
    description: "ความเชี่ยวชาญและความชำนาญในการปฏิบัติงาน ที่เกิดจากการฝึกฝนและประสบการณ์",
    icon: Target,
    color: "bg-teal-100 text-teal-600",
    delay: 0.3,
  },
  {
    title: "Attributes (คุณลักษณะ)",
    description: "ทัศนคติ พฤติกรรม และบุคลิกภาพที่ส่งเสริมให้การทำงานประสบความสำเร็จ",
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    delay: 0.4,
  },
];

export const CompetencyInfoSection: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-bold mb-4 border border-teal-100"
          >
            <Zap size={14} />
            <span>Definition</span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            อะไรคือ <span className="text-primary">สมรรถนะ?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            สมรรถนะ (Competency) คือกลุ่มของความรู้ ทักษะ และคุณลักษณะเชิงพฤติกรรม ที่จำเป็นในการทำงานให้บรรลุผลสำเร็จตามเป้าหมาย หรือที่เรียกกันว่าโมเดล
            <span className="font-bold text-slate-800 mx-1">K-S-A</span>
          </motion.p>
        </div>

        {/* KSA Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {ksaData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={32} />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">{item.title}</h3>

              <p className="text-slate-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Line / Why it matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-2">ทำไมต้องประเมินสมรรถนะ?</h4>
          <p className="text-slate-600 max-w-4xl mx-auto">
            การประเมินสมรรถนะช่วยให้องค์กรทราบถึงช่องว่างทางทักษะ (Skill Gap) ของบุคลากร เพื่อวางแผนการพัฒนา (IDP) ได้อย่างตรงจุด และช่วยให้พนักงานทราบถึงระดับความสามารถของตนเอง
            เทียบกับมาตรฐานสากลอย่าง <span className="font-bold text-blue-600">SFIA</span> และ <span className="font-bold text-emerald-600">TPQI</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
