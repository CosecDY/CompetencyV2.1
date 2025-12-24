import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Link as LinkIcon, Save, CheckCircle, AlertCircle, FileText, ExternalLink, ChevronRight, Loader2, Lock } from "lucide-react";
import { useCompetency } from "../hooks/useCompetency";
import { CompetencyDetail, EvidenceItem } from "../services/competencyService";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

export default function EvidenceDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const source = searchParams.get("source") as "TPQI" | "SFIA" | null;
  const id = searchParams.get("id");
  const level = searchParams.get("level");

  const { getCompetencyDetail, saveEvidence, loading: dataLoading, error } = useCompetency();
  const [data, setData] = useState<CompetencyDetail | null>(null);

  useEffect(() => {
    if (source && id && level) {
      const fetchData = async () => {
        const result = await getCompetencyDetail(source, id, Number(level));
        if (result) {
          setData(result);
        }
      };
      fetchData();
    }
  }, [source, id, level, getCompetencyDetail]);

  const handleSave = async (itemId: number, url: string) => {
    if (!data || !source) return;

    // Safety Check
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
      return;
    }

    const success = await saveEvidence({ source, itemId, url });

    if (success) {
      const updatedItems = data.items.map((item) => {
        if (item.itemId === itemId) {
          return {
            ...item,
            evidenceUrl: url,
            status: "PENDING" as const,
          };
        }
        return item;
      });
      setData({ ...data, items: updatedItems });
    }
  };

  if ((dataLoading || authLoading) && !data) {
    return (
      <div className="theme-competency min-h-screen flex flex-col items-center justify-center bg-background text-muted">
        <Loader2 className="animate-spin mb-4 text-primary" size={40} />
        <p>กำลังโหลดข้อมูลรายละเอียด...</p>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="theme-competency min-h-screen flex flex-col items-center justify-center bg-background text-muted">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">ไม่พบข้อมูล</h2>
        <p className="mb-6">{error || "ไม่สามารถโหลดข้อมูลได้ หรือข้อมูลไม่ครบถ้วน"}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-full font-medium transition-colors text-slate-700">
          ย้อนกลับ
        </button>
      </div>
    );
  }

  const completedCount = data.items.filter((i) => i.status !== "EMPTY").length;
  const totalCount = data.items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="theme-competency min-h-screen font-sans text-maintext pb-20">
          {/* Guest Warning */}
          {!authLoading && !isAuthenticated && (
            <div className="bg-slate-800 text-white text-center py-2 text-sm px-4 relative z-30">
              <div className="flex items-center justify-center gap-2">
                <Lock size={14} />
                <span>
                  คุณกำลังดูในโหมด Guest <strong>กรุณาเข้าสู่ระบบ</strong> เพื่อบันทึกหลักฐาน
                </span>
                <button onClick={() => navigate("/login")} className="underline font-bold hover:text-primary-light ml-2 transition-colors">
                  Login ที่นี่
                </button>
              </div>
            </div>
          )}

          {/* --- HEADER SECTION --- */}
          <div className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 shadow-sm transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-muted hover:text-primary transition-colors text-sm font-medium group">
                  <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                  กลับไปหน้าค้นหา
                </button>
                <div className="flex items-center gap-2 text-xs text-muted/70">
                  <span>Competency</span>
                  <ChevronRight size={12} />
                  <span>{data.source}</span>
                  <ChevronRight size={12} />
                  <span className="text-maintext font-bold">{data.id}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`border px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        data.source === "TPQI" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                      }`}
                    >
                      {data.source} Standard
                    </span>
                    <span className="bg-primary/10 text-primary-dark border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Level {data.level}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-maintext leading-tight">{data.title}</h1>
                  <p className="text-muted text-sm mt-1">{data.category}</p>
                </div>

                {/* Progress Card */}
                <div className="bg-background rounded-lg p-3 border border-border min-w-[180px] shadow-sm">
                  <div className="flex justify-between text-xs mb-2 font-medium text-muted">
                    <span>ความคืบหน้า</span>
                    <span>
                      {completedCount}/{totalCount} รายการ
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- CONTENT SECTION --- */}
          <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
            {/* Description Box */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm mb-8">
              <h3 className="flex items-center gap-2 text-sm font-bold text-maintext mb-2 uppercase tracking-wide">
                <FileText size={16} className="text-primary" />
                คำอธิบายระดับชั้น (Description)
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">{data.description || "ไม่มีคำอธิบายเพิ่มเติม"}</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-maintext flex items-center gap-2">
                รายการหลักฐานที่ต้องส่ง <span className="text-muted font-normal text-sm">({totalCount} Items)</span>
              </h2>

              {data.items.map((item, index) => (
                <EvidenceItemRow key={item.itemId} item={item} index={index} onSave={handleSave} loading={dataLoading} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
}

// --- SUB-COMPONENT: Item Row ---

interface EvidenceItemRowProps {
  item: EvidenceItem;
  index: number;
  onSave: (id: number, url: string) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

function EvidenceItemRow({ item, index, onSave, loading, isAuthenticated }: EvidenceItemRowProps) {
  const [url, setUrl] = useState(isAuthenticated ? item.evidenceUrl || "" : "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setUrl(item.evidenceUrl || "");
    } else {
      setUrl("");
    }
  }, [item.evidenceUrl, isAuthenticated]);

  const isChanged = url !== (item.evidenceUrl || "");
  const isEmpty = url.trim() === "";

  return (
    <div
      className={`group relative bg-surface rounded-xl border transition-all duration-300 ${isFocused ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border hover:border-primary/50"}`}
    >
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex gap-3 w-full">
          {/* Badge Number */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
              item.status === "APPROVED"
                ? "bg-green-50 text-green-600 border-green-200"
                : item.status === "PENDING"
                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {index + 1}
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-muted/70">ID: {item.itemId}</span>
              {item.status === "APPROVED" && (
                <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                  <CheckCircle size={10} /> อนุมัติแล้ว
                </span>
              )}
              {item.status === "PENDING" && (
                <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded">
                  <AlertCircle size={10} /> รอตรวจสอบ
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-maintext pr-4 leading-tight">{item.text}</h4>
          </div>
        </div>
      </div>

      <div className="p-5 pt-2 pl-[4.25rem]">
        {item.description && <p className="text-sm text-slate-500 mb-4 leading-relaxed">{item.description}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isAuthenticated ? <LinkIcon size={14} className={`transition-colors ${isFocused ? "text-primary" : "text-slate-400"}`} /> : <Lock size={14} className="text-slate-400" />}
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={!isAuthenticated}
              placeholder={isAuthenticated ? "วางลิงก์หลักฐาน (Google Drive, Github...)" : "กรุณาเข้าสู่ระบบเพื่อเพิ่มข้อมูล"}
              className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm transition-all 
                ${
                  !isAuthenticated
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-background border-border text-maintext focus:bg-surface focus:outline-none focus:border-transparent placeholder:text-muted/60"
                }`}
            />

            {url && isAuthenticated && (
              <a href={url} target="_blank" rel="noreferrer" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary cursor-pointer transition-colors">
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <button
            onClick={() => onSave(item.itemId, url)}
            disabled={isEmpty || (!isChanged && item.status !== "EMPTY") || loading || !isAuthenticated}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-w-[100px] ${
              isAuthenticated && isChanged && !isEmpty ? "bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 translate-y-0" : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {loading && isChanged ? <Loader2 className="animate-spin" size={16} /> : !isAuthenticated ? <Lock size={16} /> : <Save size={16} />}
            <span>{isAuthenticated ? "บันทึก" : "Login"}</span>
          </button>
        </div>
      </div>

      {/* Side Color Strip */}
      <div
        className={`absolute top-4 bottom-4 left-0 w-1 rounded-r-full transition-colors ${
          item.status === "APPROVED" ? "bg-green-400" : item.status === "PENDING" ? "bg-yellow-400" : "bg-transparent"
        }`}
      ></div>
    </div>
  );
}
