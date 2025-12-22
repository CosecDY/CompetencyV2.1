import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Briefcase, Globe, ChevronRight, Loader2, X, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useCompetency } from "../hooks/useCompetency";
import { CompetencySearchResult } from "../services/competencyService";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

// --- HELPER: Highlight Search Term ---
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span className="text-slate-700">{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span className="text-slate-700">
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-teal-100 text-teal-800 font-bold px-1 rounded-sm border-b-2 border-teal-200">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

function parseTpqiTitle(item: CompetencySearchResult) {
  if (item.source !== "TPQI") {
    return { title: item.title, category: item.category };
  }
  const splitKey = "อาชีพ";
  const index = item.title.lastIndexOf(splitKey);
  if (index !== -1) {
    return {
      category: item.title.substring(0, index).trim(),
      title: item.title.substring(index + splitKey.length).trim(),
    };
  }
  return { title: item.title, category: item.category };
}

const SearchEmptyState = ({ onTagClick }: { onTagClick: (tag: string) => void }) => {
  const popularTags = ["Software", "Management", "Security", "Analysis", "System", "Digital Marketing", "Leadership"];

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in ">
      {/* Icon Graphic */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center relative z-10">
          <Search className="h-10 w-10 text-teal-500" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-teal-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">เริ่มการค้นหาของคุณ</h2>
      <p className="text-slate-500 text-center max-w-md mb-10 leading-relaxed">
        ค้นหาอาชีพ ทักษะ หรือสมรรถนะที่คุณต้องการจากฐานข้อมูลมาตรฐานสากล <span className="font-semibold text-blue-600">SFIA</span> และ <span className="font-semibold text-emerald-600">TPQI</span>
      </p>

      {/* Popular Tags Section */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-semibold uppercase tracking-wider">
          <TrendingUp size={16} />
          <span>ตัวอย่างคำค้นหา</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-4 py-2 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-200 rounded-lg text-sm transition-all duration-200 active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Standard Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">SFIA Framework</h4>
            <p className="text-xs text-blue-700/70 mt-1">มาตรฐานสากลด้านไอทีครอบคลุม 7 ระดับ</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Briefcase className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">TPQI Standard</h4>
            <p className="text-xs text-emerald-700/70">มาตรฐานคุณวุฒิวิชาชีพของประเทศไทย</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Skeleton ---
const ResultSkeleton = () => (
  <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-[180px] animate-pulse shadow-sm flex">
        <div className="flex-1 space-y-4">
          <div className="h-4 w-24 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="w-48 ml-6 border-l border-slate-50 pl-6 flex flex-col justify-center gap-2">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="h-8 w-8 bg-slate-100 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- MAIN PAGE ---
export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchCompetency, loading, error } = useCompetency();

  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<CompetencySearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setHasSearched(true);
    const data = await searchCompetency(term);
    if (data) {
      setResults(data);
    }
  };

  const handleSearchClick = () => {
    if (!searchTerm.trim()) return;
    setSearchParams({ q: searchTerm });
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    setSearchParams({ q: tag });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSelectLevel = (source: string, id: string | number, level: number) => {
    navigate(`/search-career/detail?source=${source}&id=${id}&level=${level}`);
  };

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="theme-competency min-h-screen flex flex-col font-sans text-slate-800 ">
          {/* --- HEADER SECTION --- */}
          <div className="pt-6 pb-6 px-4 sticky  z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 tracking-tight text-slate-900">
                ค้นหาอาชีพและทักษะ <span className="text-primary">สมรรถนะ</span>
              </h1>

              <div className="relative group shadow-lg rounded-full transition-shadow hover:shadow-xl ring-1 ring-slate-200">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 transition-colors duration-200 ${loading ? "text-primary animate-bounce" : "text-slate-400 group-focus-within:text-primary"}`} />
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="block w-full pl-12 pr-32 py-4 bg-white rounded-full text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-slate-50"
                  placeholder="พิมพ์ชื่ออาชีพ หรือทักษะ..."
                />

                <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                  {searchTerm && !loading && (
                    <button onClick={handleClearSearch} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="ล้างคำค้นหา">
                      <X size={18} />
                    </button>
                  )}

                  <button
                    onClick={handleSearchClick}
                    disabled={loading}
                    className="px-6 h-full bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "ค้นหา"}
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              {hasSearched && !loading && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 animate-in fade-in slide-in-from-top-2 px-2">
                  <span>
                    ผลลัพธ์การค้นหาสำหรับ: <span className="font-semibold text-primary">"{searchTerm}"</span>
                  </span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600">พบ {results.length} รายการ</span>
                </div>
              )}
            </div>
          </div>

          {/* --- CONTENT AREA --- */}
          <div className="flex-1 w-full px-4 py-8 bg-slate-50/50">
            {loading && <ResultSkeleton />}
            {!loading && !hasSearched && <SearchEmptyState onTagClick={handleTagClick} />}

            {/* 3. Not Found (ค้นหาแล้วไม่เจอ) */}
            {hasSearched && !loading && results.length === 0 && !error && (
              <div className="text-center py-20 max-w-lg mx-auto opacity-80">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 rotate-12">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">ไม่พบข้อมูล</h3>
                <p className="text-slate-500 mt-2">ลองใช้คำค้นหาที่กว้างขึ้น หรือตรวจสอบตัวสะกดอีกครั้ง</p>
                <button onClick={handleClearSearch} className="mt-6 text-primary font-semibold hover:underline">
                  ล้างคำค้นหาและลองใหม่
                </button>
              </div>
            )}

            {/* 4. Results List */}
            {!loading && hasSearched && results.length > 0 && (
              <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-20">
                {results.map((item) => {
                  const displayData = parseTpqiTitle(item);

                  return (
                    <div
                      key={`${item.source}-${item.id}`}
                      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group flex flex-col md:flex-row overflow-hidden relative"
                    >
                      {/* Left Side: Info */}
                      <div className="p-6 md:p-7 flex-1 flex flex-col justify-center relative z-10">
                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                              item.source === "TPQI" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                            }`}
                          >
                            {item.source === "TPQI" ? <Briefcase size={10} /> : <Globe size={10} />}
                            {item.source}
                          </span>
                          <span className="text-slate-300">/</span>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide line-clamp-1" title={displayData.category}>
                            {displayData.category}
                          </p>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">
                          <HighlightText text={displayData.title} highlight={searchTerm} />
                        </h3>

                        {/* Description */}
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 pr-4">{item.description}</p>
                      </div>

                      {/* Right Side: Action Panel */}
                      <div className="bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-100 p-5 md:w-[260px] flex flex-col justify-center shrink-0">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <SlidersHorizontal size={10} /> เลือกระดับประเมิน
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full">
                          {item.availableLevels && item.availableLevels.length > 0 ? (
                            item.availableLevels.map((level) => (
                              <button
                                key={level}
                                onClick={() => handleSelectLevel(item.source, item.id, level)}
                                className="h-9 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-bold shadow-sm 
                                hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                              >
                                L{level}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-3 text-center py-4 bg-slate-100 rounded-lg border border-dashed border-slate-300">
                              <span className="text-xs text-slate-400">ไม่มีข้อมูลระดับ</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button className="text-xs font-medium text-slate-400 group-hover:text-primary flex items-center transition-colors">
                            รายละเอียด <ChevronRight size={14} className="ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
}
