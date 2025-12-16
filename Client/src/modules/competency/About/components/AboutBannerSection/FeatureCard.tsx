const FeatureCard = ({ feature, index, isVisible }: any) => {
  const Icon = feature.icon;
  return (
    <div
      className={`transition-all duration-500 delay-${index * 100 + 700} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-teal-200 rounded-2xl p-8 hover:shadow-xl hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 group h-full">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:from-teal-600 group-hover:to-teal-700 transition-all duration-300 shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight group-hover:text-teal-800 transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
