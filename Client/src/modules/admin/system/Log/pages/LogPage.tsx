import { useState, useMemo, useEffect } from "react";
import { FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useLogManager } from "modules/admin/rbac/hooks/useLogManager";
import { Log } from "modules/admin/rbac/types/logTypes";
import { DeleteLogModal } from "./LogModals";

export default function LogPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, deleteLog } = useLogManager({ page, perPage }, handleToast);

  // Modal handlers
  const openDeleteModal = (log: Log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelectedLog(null);
    setModalOpen(false);
  };
  const confirmDelete = () => {
    if (!selectedLog) return;
    deleteLog.mutate(selectedLog.id, {
      onSuccess: () => closeModal(),
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "databaseName", header: "Database" },
      { accessorKey: "tableName", header: "Table" },
      { accessorKey: "recordId", header: "Record ID" },
      { accessorKey: "userId", header: "User ID" },
      {
        accessorFn: (row: Log) => (row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"),
        header: "Timestamp",
      },
      {
        id: "actions",
        header: () => (
          <span className="float-right">
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Log } }) => (
          <div className="text-right">
            <RowActions onDelete={() => openDeleteModal(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Logs</h1>
        <div className="relative">
          <Input type="text" placeholder="Search logs..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <DataTable<Log>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <DeleteLogModal isOpen={modalOpen} logId={selectedLog?.id} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteLog.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
