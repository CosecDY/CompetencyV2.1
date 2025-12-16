import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useSessionManager } from "modules/admin/rbac/hooks/useSessions";
import { Session } from "modules/admin/rbac/types/sessionTypes";
import { DataTable, RowActions, Input, Toast } from "@Components/Admin/Common/ExportComponent";
import { DeleteSessionModal } from "./SessionModals";

export default function SessionPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, deleteSession } = useSessionManager({ page, perPage, search: debouncedSearchText }, handleToast);

  const openDeleteModal = (session: Session) => {
    setSelectedSession(session);
    setModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedSession(null);
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!selectedSession) return;
    deleteSession.mutate(selectedSession.id, {
      onSuccess: () => {
        handleToast("Session deleted successfully", "success");
        closeDeleteModal();
      },
    });
  };

  const columns = [
    { accessorKey: "id", header: "Session ID" },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "expiresAt", header: "Expires At" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Session & { status?: "online" | "offline" } } }) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full mt-1 ${row.original.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
          <span>{row.original.status}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Session & { status: string } } }) => (
        <div className="text-right">
          <RowActions onDelete={() => openDeleteModal(row.original)} />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-4xl font-semibold">Session List</h1>
          <div className="relative">
            <Input type="text" placeholder="Search sessions..." className="pl-3 pr-10 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <DataTable<Session>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />

        {selectedSession && (
          <DeleteSessionModal isOpen={modalOpen} sessionId={selectedSession.id} onClose={closeDeleteModal} onConfirm={confirmDelete} isLoading={deleteSession.status === "pending"} />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}
