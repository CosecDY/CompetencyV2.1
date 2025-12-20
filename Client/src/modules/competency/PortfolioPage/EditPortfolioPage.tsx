import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";
import { usePortfolio } from "./hooks/usePortfolio";
import LoadingState from "./components/states/LoadingState";

const EditPortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // --- STATE ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSfia, setSelectedSfia] = useState<Set<string>>(new Set());
  const [selectedTpqi, setSelectedTpqi] = useState<Set<string>>(new Set());
  const [isInitializing, setIsInitializing] = useState(true);

  // --- HOOKS ---
  const { portfolioData, fetchMasterPortfolio, fetchPortfolioById, updatePortfolio, loading } = usePortfolio();

  // --- 1. Load Data ---
  useEffect(() => {
    const initData = async () => {
      if (!user?.id || !id) return;

      setIsInitializing(true);
      try {
        const currentData = await fetchPortfolioById(id);
        if (currentData) {
          setName(currentData.portfolioName || "");
          setDescription(currentData.portfolioDescription || "");

          // Set Checkboxes (SFIA)
          const sfiaSet = new Set<string>();
          if (currentData.sfiaSkills && Array.isArray(currentData.sfiaSkills)) {
            currentData.sfiaSkills.forEach((s) => {
              if (s.skillCode) sfiaSet.add(s.skillCode);
            });
          }
          setSelectedSfia(sfiaSet);

          // Set Checkboxes (TPQI)
          const tpqiSet = new Set<string>();
          if (currentData.tpqiCareers && Array.isArray(currentData.tpqiCareers)) {
            currentData.tpqiCareers.forEach((c) => {
              if (c.careerLevelId) tpqiSet.add(String(c.careerLevelId));
            });
          }
          setSelectedTpqi(tpqiSet);
        }

        await fetchMasterPortfolio(user.id, user.email || "");
      } catch (error) {
        console.error("Error loading data:", error);
        alert("ไม่สามารถโหลดข้อมูลได้");
        navigate("/portfolio");
      } finally {
        setIsInitializing(false);
      }
    };

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id]);

  // --- HANDLERS ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const items = [
      ...Array.from(selectedSfia).map((exId) => ({ sourceType: "SFIA" as const, externalId: exId })),
      ...Array.from(selectedTpqi).map((exId) => ({ sourceType: "TPQI" as const, externalId: exId })),
    ];

    if (items.length === 0) return alert("กรุณาเลือกอย่างน้อย 1 รายการ");

    try {
      await updatePortfolio(id, name, description, items);
      navigate("/portfolio");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const toggleSet = (set: Set<string>, val: string, setFunc: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(set);
    if (newSet.has(val)) newSet.delete(val);
    else newSet.add(val);
    setFunc(newSet);
  };

  if (!user)
    return (
      <Layout>
        <div className="text-center p-20">กรุณาเข้าสู่ระบบ</div>
      </Layout>
    );
  if (isInitializing)
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate("/portfolio")} className="p-2 hover:bg-white rounded-full transition text-gray-500">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">✏️ แก้ไข Portfolio</h1>
              <p className="text-gray-500 text-sm">ID: {id}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Info */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">ข้อมูลพื้นฐาน</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อ Portfolio *</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">คำอธิบาย</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t flex flex-col gap-3">
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 shadow font-semibold">
                    {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </button>
                  <button type="button" onClick={() => navigate("/portfolio")} className="w-full border py-2.5 rounded-lg hover:bg-gray-50 text-gray-600">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Selection */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">เลือกข้อมูล ({selectedSfia.size + selectedTpqi.size})</h3>
              </div>

              {!portfolioData || (!portfolioData.sfiaSkills?.length && !portfolioData.tpqiCareers?.length) ? (
                <div className="text-center py-10 text-gray-400">กำลังโหลดรายการตัวเลือก...</div>
              ) : (
                <div className="space-y-6">
                  {/* SFIA List */}
                  <div>
                    <h4 className="font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded mb-3">SFIA Skills</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {portfolioData.sfiaSkills.map((s) => (
                        <label
                          key={s.id}
                          className={`flex gap-3 p-3 rounded border cursor-pointer transition ${selectedSfia.has(s.skillCode || "") ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSfia.has(s.skillCode || "")}
                            onChange={() => toggleSet(selectedSfia, s.skillCode || "", setSelectedSfia)}
                            className="mt-1 w-4 h-4 text-blue-600"
                          />
                          <div className="text-sm">
                            <div className="font-bold text-gray-800">{s.skillCode}</div>
                            <div className="text-gray-600">{s.skill?.name}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TPQI List */}
                  <div>
                    <h4 className="font-semibold text-green-700 bg-green-50 px-3 py-2 rounded mb-3">TPQI Careers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {portfolioData.tpqiCareers.map((c) => (
                        <label
                          key={c.id}
                          className={`flex gap-3 p-3 rounded border cursor-pointer transition ${selectedTpqi.has(String(c.careerLevelId)) ? "border-green-500 bg-green-50" : "hover:border-green-300"}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTpqi.has(String(c.careerLevelId))}
                            onChange={() => toggleSet(selectedTpqi, String(c.careerLevelId), setSelectedTpqi)}
                            className="mt-1 w-4 h-4 text-green-600"
                          />
                          <div className="text-sm">
                            <div className="font-bold text-gray-800">{c.career.name}</div>
                            <div className="text-xs text-gray-400 mt-1">Level {c.level.name}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default EditPortfolioPage;
