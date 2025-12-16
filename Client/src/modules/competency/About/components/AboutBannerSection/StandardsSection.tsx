import StandardCard from "./StandardCard";

const standards = [
  {
    label: "TPQI (Thailand Professional Qualification Institute)",
    link: "https://www.tpqi.go.th/th/standard/rQNWewEb3Q",
    description:
      "มาตรฐานสมรรถนะระดับชาติที่ใช้เป็นเกณฑ์วัดความสามารถในแต่ละสาขาอาชีพ",
    lastUpdated: "อัปเดตล่าสุดเมื่อ 5 มกราคม พ.ศ. 2564",
  },
  {
    label: "SFIA (Skills Framework for the Information Age) Version 9",
    link: "https://sfia-online.org",
    description: "มาตรฐานทักษะด้านดิจิทัลและไอทีที่ได้รับการยอมรับทั่วโลก",
    lastUpdated: "เผยแพร่เมื่อเดือนตุลาคม พ.ศ. 2564",
  },
];

const StandardsSection = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={`mb-20 transition-all duration-700 delay-200 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="space-y-8">
      {standards.map((item, index) => (
        <StandardCard
          key={index}
          item={item}
          index={index}
          isVisible={isVisible}
        />
      ))}
    </div>
  </div>
);
export default StandardsSection;
