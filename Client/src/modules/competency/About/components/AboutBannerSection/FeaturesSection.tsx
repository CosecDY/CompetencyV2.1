import { Target, User, BarChart3, RefreshCw } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    title: "ประเมินทักษะตามมาตรฐาน TPQI และ SFIA",
    description:
      "ช่วยวิเคราะห์ศักยภาพของบุคคล และเปรียบเทียบกับเกณฑ์มาตรฐานในสายอาชีพที่เกี่ยวข้อง",
    icon: Target,
  },
  {
    title: "สร้างโปรไฟล์สมรรถนะส่วนบุคคล",
    description:
      "รวบรวมข้อมูลทักษะ ความสามารถ และแฟ้มสะสมผลงาน เพื่อใช้สมัครงานหรือพัฒนาตัวเอง",
    icon: User,
  },
  {
    title: "แสดงผลการวิเคราะห์ด้วยแผนภาพ",
    description:
      "ช่วยให้เห็นจุดแข็ง จุดที่ต้องพัฒนา และแนวทางการพัฒนาทักษะอย่างเป็นระบบ",
    icon: BarChart3,
  },
  {
    title: "รองรับการอัปเดตข้อมูลทักษะและอาชีพ",
    description:
      "สามารถปรับปรุงข้อมูลส่วนตัว และเชื่อมโยงกับมาตรฐานสมรรถนะที่อัปเดตล่าสุด",
    icon: RefreshCw,
  },
];

const FeaturesSection = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={`transition-all duration-700 delay-600 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="text-center mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        คุณสมบัติของระบบ
      </h2>
      <div className="w-8 h-px bg-teal-400 mx-auto"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={index}
          isVisible={isVisible}
        />
      ))}
    </div>
  </div>
);
export default FeaturesSection;
