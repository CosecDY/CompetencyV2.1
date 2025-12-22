import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@Contexts/AuthContext";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";
import { PencilSquareIcon, TrashIcon, ExclamationTriangleIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

// Hook
import { usePortfolio } from "./hooks/usePortfolio";

// UI Components
import LoadingState from "./components/states/LoadingState";
import ErrorState from "./components/states/ErrorState";
import PortfolioHeader from "./components/layout/PortfolioHeader";
import NavigationTabs, { TabType } from "./components/sections/NavigationTabs";
import PortfolioContent from "./components/sections/PortfolioContent";

type ViewMode = "LIST" | "DETAIL";

const PortfolioDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // --- STATE ---
  const [mode, setMode] = useState<ViewMode>("LIST");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- HOOKS ---
  const { portfolioList, portfolioData, loading, error, fetchUserPortfolios, fetchPortfolioById, deletePortfolio, clearError } = usePortfolio();

  // --- EFFECTS ---
  useEffect(() => {
    if (user?.id) fetchUserPortfolios(user.id);
  }, [user, fetchUserPortfolios]);

  useEffect(() => {
    if (mode === "DETAIL" && selectedPortfolioId) {
      fetchPortfolioById(selectedPortfolioId);
    }
  }, [mode, selectedPortfolioId, fetchPortfolioById]);

  // --- HANDLERS ---
  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsDeleting(true);
    try {
      await deletePortfolio(idToDelete);
      if (mode === "DETAIL") setMode("LIST");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  // --- RENDERERS ---

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <FolderOpenIcon className="w-10 h-10 inline mr-2 text-teal-500" /> My Portfolios
          </h1>
          <p className="text-gray-500 text-sm mt-1">จัดการพอร์ตโฟลิโอทั้งหมดของคุณ ({portfolioList.length})</p>
        </div>

        <Link to="/portfolio/create" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg shadow transition flex items-center gap-2 font-semibold text-sm">
          <i className="fas fa-plus-circle"></i> สร้างใหม่
        </Link>
      </div>

      {portfolioList.length === 0 ? (
        <div className="text-center py-24 bg-white/50 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-400 text-lg mb-4">ยังไม่มี Portfolio</p>
          <Link to="/portfolio/create" className="text-teal-600 hover:underline font-bold">
            เริ่มสร้างเล่มแรก
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioList.map((pf) => (
            <div
              key={pf.id}
              onClick={() => {
                setSelectedPortfolioId(pf.id);
                setMode("DETAIL");
              }}
              className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-gray-100 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 group-hover:bg-teal-600"></div>
              <h3 className="text-lg font-bold text-gray-800 truncate pr-8">{pf.name}</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">{new Date(pf.updatedAt).toLocaleDateString("th-TH")}</p>
              <p className="text-gray-600 text-sm line-clamp-2 h-10 mb-4">{pf.description || "-"}</p>

              <div className="flex justify-between items-center border-t pt-3 mt-auto">
                <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded font-medium">{pf._count.items} รายการ</span>
                <div className="flex items-center gap-1">
                  <Link to={`/portfolio/edit/${pf.id}`} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-blue-500 transition p-2 rounded-full hover:bg-blue-50" title="แก้ไข">
                    <PencilSquareIcon className="w-5 h-5" />
                  </Link>

                  <button onClick={(e) => openDeleteModal(e, pf.id)} className="text-gray-300 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50" title="ลบ">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (loading) return <LoadingState />;
    if (!portfolioData) return <div className="text-center p-10">ไม่พบข้อมูล</div>;

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode("LIST")} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-white transition">
              <i className="fas fa-arrow-left"></i> กลับหน้ารวม
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <span className="text-gray-400 text-sm italic">Portfolio: </span>
            <span className="font-semibold text-gray-700">{portfolioData.portfolioName}</span>
          </div>

          {/* Delete button inside detail view */}
          <button onClick={(e) => selectedPortfolioId && openDeleteModal(e, selectedPortfolioId)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition">
            <TrashIcon className="w-4 h-4" /> ลบชุดนี้
          </button>
        </div>

        <PortfolioHeader userEmail={portfolioData.userEmail} loading={loading} onRefresh={() => selectedPortfolioId && fetchPortfolioById(selectedPortfolioId)} />

        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} sfiaSkillsCount={portfolioData.sfiaSkills.length} tpqiCareersCount={portfolioData.tpqiCareers.length} />
        </div>

        <PortfolioContent activeTab={activeTab} portfolioData={portfolioData} />
      </div>
    );
  };

  if (!user)
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 mb-4">กรุณาเข้าสู่ระบบเพื่อจัดการ Portfolio ของคุณ</p>
          <Link to="/login" className="bg-teal-600 text-white px-6 py-2 rounded-lg">
            เข้าสู่ระบบ
          </Link>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="container mx-auto px-4 py-8 min-h-screen max-w-7xl">
          {error && <ErrorState error={error} onRetry={() => user?.id && fetchUserPortfolios(user.id)} onDismiss={clearError} />}

          {mode === "LIST" && renderList()}
          {mode === "DETAIL" && renderDetail()}
        </div>
      </WhiteTealBackground>

      {/* Modern Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-50 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900">ยืนยันการลบ?</h3>
            <p className="text-sm text-center text-gray-500 mt-2 px-4">ข้อมูล Portfolio และรายการที่เกี่ยวข้องจะถูกลบออกอย่างถาวร ไม่สามารถย้อนกลับได้</p>

            <div className="flex gap-3 mt-8">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-sm shadow-red-200"
              >
                {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "ใช่, ลบเลย"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PortfolioDashboardPage;
