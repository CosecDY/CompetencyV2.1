import { useEffect, useState } from "react";
import { Link as LinkIcon, Save, CheckCircle, AlertCircle, ExternalLink, Loader2, Lock, Trash2, BookOpen, Wrench } from "lucide-react";
import { EvidenceItem } from "../../../services/competencyService";

interface EvidenceItemRowProps {
  item: EvidenceItem;
  index: number;
  onSave: (id: number, url: string) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  isAuthenticated: boolean;
  source: "TPQI" | "SFIA" | null;
  errorMessage?: string;
  onClearError?: () => void;
}

export function EvidenceItemRow({ item, index, onSave, onDelete, loading, isAuthenticated, source, errorMessage, onClearError }: EvidenceItemRowProps) {
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
  const isSaved = item.status !== "EMPTY" && item.evidenceUrl;
  const isKnowledge = item.type === "KNOWLEDGE";
  const hasError = !!errorMessage;

  return (
    <div
      className={`group relative bg-surface rounded-xl border transition-all duration-300 ${
        hasError ? "border-red-300 shadow-sm ring-1 ring-red-100" : isFocused ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border hover:border-primary/50"
      }`}
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono text-muted/70">ID: {item.itemId}</span>

              {source === "TPQI" && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    isKnowledge ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {isKnowledge ? <BookOpen size={10} /> : <Wrench size={10} />}
                  {isKnowledge ? "KNOWLEDGE" : "SKILL"}
                </span>
              )}

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

        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isAuthenticated ? (
                <LinkIcon size={14} className={`transition-colors ${hasError ? "text-red-400" : isFocused ? "text-primary" : "text-slate-400"}`} />
              ) : (
                <Lock size={14} className="text-slate-400" />
              )}
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (hasError && onClearError) onClearError();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={!isAuthenticated}
              placeholder={isAuthenticated ? "วางลิงก์หลักฐาน (Google Drive, Github...)" : "กรุณาเข้าสู่ระบบเพื่อเพิ่มข้อมูล"}
              className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm transition-all 
                ${
                  !isAuthenticated
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : hasError
                    ? "bg-red-50 border-red-300 text-red-900 focus:bg-white focus:border-red-500 focus:outline-none placeholder:text-red-300"
                    : "bg-background border-border text-maintext focus:bg-surface focus:outline-none focus:border-transparent placeholder:text-muted/60"
                }`}
            />

            {url && isAuthenticated && (
              <a href={url} target="_blank" rel="noreferrer" className="absolute top-0 bottom-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary cursor-pointer transition-colors">
                <ExternalLink size={14} />
              </a>
            )}

            {/* Error Message Display */}
            {hasError && (
              <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                <AlertCircle size={12} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isAuthenticated && isSaved && !isChanged && (
              <button
                onClick={() => onDelete(item.itemId)}
                disabled={loading}
                className="flex items-center justify-center px-3 py-2.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                title="ลบข้อมูล"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              </button>
            )}

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

        {hasError && <div className="h-4"></div>}
      </div>

      <div
        className={`absolute top-4 bottom-4 left-0 w-1 rounded-r-full transition-colors ${
          item.status === "APPROVED" ? "bg-green-400" : item.status === "PENDING" ? "bg-yellow-400" : "bg-transparent"
        }`}
      ></div>
    </div>
  );
}
