const PurposeSection = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={`mb-20 transition-all duration-700 delay-400 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="text-center mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        วัตถุประสงค์ของระบบ
      </h2>
      <div className="w-8 h-px bg-teal-400 mx-auto"></div>
    </div>
    <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-8 shadow-lg">
      <p className="text-lg text-gray-800 leading-relaxed text-center">
        ระบบนี้มีเป้าหมายในการช่วยให้บุคคลสามารถประเมินสมรรถนะของตนเองได้อย่างแม่นยำ
        โดยอ้างอิงจากมาตรฐาน{" "}
        <span className="font-semibold text-teal-700">TPQI</span> และ{" "}
        <span className="font-semibold text-teal-700">SFIA</span>{" "}
        เพื่อสนับสนุนการพัฒนาทักษะให้สอดคล้องกับความต้องการของตลาดแรงงาน
        ทั้งในระดับประเทศและระดับสากล
      </p>
    </div>
  </div>
);
export default PurposeSection;
