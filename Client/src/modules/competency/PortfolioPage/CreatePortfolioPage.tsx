import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";
import { usePortfolio } from "./hooks/usePortfolio";
import LoadingState from "./components/states/LoadingState";

const CreatePortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedSfia, setSelectedSfia] = useState<Set<string>>(new Set());
  const [selectedTpqi, setSelectedTpqi] = useState<Set<string>>(new Set());

  const { portfolioData, loading, fetchMasterPortfolio, createPortfolio } = usePortfolio();

  useEffect(() => {
    if (user?.id) fetchMasterPortfolio(user.id, user.email);
  }, [user, fetchMasterPortfolio]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const items = [
      ...Array.from(selectedSfia).map((id) => ({ sourceType: "SFIA" as const, externalId: id })),
      ...Array.from(selectedTpqi).map((id) => ({ sourceType: "TPQI" as const, externalId: id })),
    ];

    if (items.length === 0) return alert("กรุณาเลือกทักษะอย่างน้อย 1 รายการ");

    try {
      await createPortfolio(user.id, formData.name, formData.description, items);
      navigate("/portfolio");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSet = (set: Set<string>, val: string, setFunc: (newSet: Set<string>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(val)) {
      newSet.delete(val);
    } else {
      newSet.add(val);
    }
    setFunc(newSet);
  };

  if (!user)
    return (
      <Layout>
        <div className="text-center p-20">กรุณาเข้าสู่ระบบ</div>
      </Layout>
    );

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="container mx-auto px-4 py-8 min-h-screen max-w-7xl">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate("/portfolio")} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">✨ สร้าง Portfolio ใหม่</h1>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                  <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">ข้อมูลพื้นฐาน</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อ Portfolio *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="เช่น Resume สมัครงาน..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">คำอธิบาย</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t flex flex-col gap-3">
                    <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 shadow font-semibold disabled:opacity-50">
                      {loading ? "กำลังบันทึก..." : "ยืนยันการสร้าง"}
                    </button>
                    <button type="button" onClick={() => navigate("/portfolio")} className="w-full border py-2.5 rounded-lg hover:bg-gray-50 text-gray-600">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Selection */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">เลือกข้อมูล ({selectedSfia.size + selectedTpqi.size})</h3>
                </div>

                {loading ? (
                  <LoadingState />
                ) : (
                  <div className="space-y-6">
                    {/* SFIA Section */}
                    <div>
                      <h4 className="font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded mb-3 flex justify-between">
                        <span>SFIA Skills</span>
                        <span className="text-sm bg-white px-2 rounded-full shadow-sm">{selectedSfia.size}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {portfolioData?.sfiaSkills.map((s) => (
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
                        {!portfolioData?.sfiaSkills.length && <p className="text-gray-400 text-sm p-2">ไม่พบข้อมูล SFIA</p>}
                      </div>
                    </div>
                    {/* TPQI Section  */}
                    <div>
                      <h4 className="font-semibold text-green-700 bg-green-50 px-3 py-2 rounded mb-3 flex justify-between">
                        <span>TPQI Careers</span>
                        <span className="text-sm bg-white px-2 rounded-full shadow-sm">{selectedTpqi.size}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {portfolioData?.tpqiCareers.map((c) => (
                          <label
                            key={c.id}
                            className={`flex gap-3 p-3 rounded border cursor-pointer transition ${
                              selectedTpqi.has(String(c.careerLevelId)) ? "border-green-500 bg-green-50" : "hover:border-green-300"
                            }`}
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
                        {!portfolioData?.tpqiCareers.length && <p className="text-gray-400 text-sm p-2">ไม่พบข้อมูล TPQI</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default CreatePortfolioPage;
