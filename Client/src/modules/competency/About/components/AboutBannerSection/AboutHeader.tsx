const AboutHeader = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={`text-center mb-16 transition-all duration-700 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-6 pt-5 tracking-tight">
      เกี่ยวกับพวกเรา
    </h1>
    <div className="w-12 h-px bg-teal-400 mx-auto mb-8"></div>
    <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
      ระบบนี้ถูกออกแบบมาเพื่อช่วยให้บุคคลสามารถประเมินและพัฒนาทักษะของตนเอง
      <br />
      ตามเกณฑ์มาตรฐานที่ได้รับการยอมรับในระดับประเทศและสากล
    </p>
  </div>
);
export default AboutHeader;
