import { ExternalLink } from "lucide-react";

const StandardCard = ({ item, index, isVisible }: any) => (
  <div
    className={`transition-all duration-500 delay-${index * 100 + 300} ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="bg-white/80 backdrop-blur-sm border border-teal-200 rounded-2xl p-8 hover:bg-teal-50 hover:border-teal-300 hover:shadow-xl transition-all duration-300 group">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-2 mb-3 group-hover:gap-3 transition-all duration-300"
      >
        {item.label}
        <ExternalLink className="w-5 h-5" />
      </a>
      <p className="text-gray-700 leading-relaxed mb-3 text-base">
        {item.description}
      </p>
      <p className="text-sm text-gray-500">{item.lastUpdated}</p>
    </div>
  </div>
);
export default StandardCard;
