import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Link as FileText, ChevronRight, Loader2, Lock } from "lucide-react";
import { useCompetency } from "../../hooks/useCompetency";
import { CompetencyDetail } from "../../services/competencyService";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";
import { EvidenceItemRow } from "./components/EvidenceItemRow";
import { CustomModal, ModalConfig } from "./components/CustomModal";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export default function EvidenceDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const source = searchParams.get("source") as "TPQI" | "SFIA" | null;
  const id = searchParams.get("id");
  const level = searchParams.get("level");

  const { getCompetencyDetail, saveEvidence, deleteEvidence, loading: globalLoading, error } = useCompetency();

  const [data, setData] = useState<CompetencyDetail | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const openModal = (config: Omit<ModalConfig, "isOpen">) => {
    setModal({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

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

  useEffect(() => {
    if (error) {
      openModal({
        type: "error",
        title: "ไม่พบข้อมูล",
        message: error || "ไม่สามารถโหลดข้อมูลได้ หรือข้อมูลไม่ครบถ้วน",
        onConfirm: () => navigate(-1),
      });
    }
  }, [error, navigate]);

  const handleClearError = (itemId: number) => {
    setSaveErrors((prev) => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleSave = async (itemId: number, url: string) => {
    if (!data || !source) return;

    if (!isAuthenticated) {
      openModal({
        type: "error",
        title: "กรุณาเข้าสู่ระบบ",
        message: "คุณต้องเข้าสู่ระบบก่อนบันทึกข้อมูล",
      });
      return;
    }

    const targetItem = data.items.find((i) => i.itemId == itemId);
    if (!targetItem) return;

    setActionLoadingId(itemId);
    handleClearError(itemId);

    try {
      let typeToSend: "SKILL" | "KNOWLEDGE" | "PERFORMANCE" | undefined = undefined;

      if (source === "TPQI") {
        const rawType = targetItem.type || "PERFORMANCE";
        if (rawType === "SKILL" || rawType === "KNOWLEDGE" || rawType === "PERFORMANCE") {
          typeToSend = rawType;
        }
      }

      const success = await saveEvidence({
        source,
        itemId,
        url,
        type: typeToSend,
      });

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

        openModal({
          type: "success",
          title: "บันทึกสำเร็จ",
          message: "ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว",
        });
      }
    } catch (err: unknown) {
      console.error("API Error:", err);
      const apiError = err as ApiErrorResponse;

      let errorMsg = "บันทึกไม่สำเร็จ กรุณาลองใหม่";
      if (apiError.response?.data?.message) {
        errorMsg = apiError.response.data.message;
      } else if (apiError.message) {
        errorMsg = apiError.message;
      }

      setSaveErrors((prev) => ({ ...prev, [itemId]: errorMsg }));

      openModal({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: errorMsg,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!data || !source) return;
    if (!isAuthenticated) return;

    openModal({
      type: "confirm",
      title: "ยืนยันการลบ",
      message: "คุณต้องการลบหลักฐานนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      onConfirm: async () => {
        closeModal();
        await executeDelete(itemId);
      },
      onCancel: () => closeModal(),
    });
  };

  const executeDelete = async (itemId: number) => {
    const targetItem = data!.items.find((i) => i.itemId === itemId);
    if (!targetItem) return;

    setActionLoadingId(itemId);
    handleClearError(itemId);

    try {
      let tpqiTypeToSend: "SKILL" | "KNOWLEDGE" | undefined = undefined;

      if (source === "TPQI") {
        if (targetItem.type === "SKILL" || targetItem.type === "KNOWLEDGE") {
          tpqiTypeToSend = targetItem.type;
        }
      }

      const success = await deleteEvidence({
        source: source!,
        itemId,
        tpqiType: tpqiTypeToSend,
      });

      if (success) {
        const updatedItems = data!.items.map((item) => {
          if (item.itemId === itemId) {
            return {
              ...item,
              evidenceUrl: null,
              status: "EMPTY" as const,
            };
          }
          return item;
        });
        setData({ ...data!, items: updatedItems });

        openModal({
          type: "success",
          title: "ลบสำเร็จ",
          message: "ข้อมูลหลักฐานถูกลบเรียบร้อยแล้ว",
        });
      }
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      openModal({
        type: "error",
        title: "ไม่สามารถลบข้อมูลได้",
        message: apiError.message || "เกิดข้อผิดพลาดในการลบ",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if ((globalLoading && !data && !error) || authLoading) {
    return (
      <div className="theme-competency min-h-screen flex flex-col items-center justify-center bg-background text-muted">
        <Loader2 className="animate-spin mb-4 text-primary" size={40} />
        <p>กำลังโหลดข้อมูลรายละเอียด...</p>
      </div>
    );
  }

  if (error && !data)
    return (
      <div className="min-h-screen bg-background">
        <CustomModal config={modal} onClose={closeModal} />
      </div>
    );

  if (!data) return null;

  const completedCount = data.items.filter((i) => i.status !== "EMPTY").length;
  const totalCount = data.items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <Layout>
      <WhiteTealBackground>
        {/* --- CUSTOM MODAL COMPONENT --- */}
        <CustomModal config={modal} onClose={closeModal} />

        <div className="theme-competency min-h-screen font-sans text-maintext pb-20">
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

          {/* --- HEADER --- */}
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

          {/* --- CONTENT --- */}
          <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
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
                <EvidenceItemRow
                  key={`${item.type}-${item.itemId}-${index}`}
                  item={item}
                  index={index}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  loading={actionLoadingId === item.itemId}
                  isAuthenticated={isAuthenticated}
                  source={source}
                  errorMessage={saveErrors[item.itemId]}
                  onClearError={() => handleClearError(item.itemId)}
                />
              ))}
            </div>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
}
