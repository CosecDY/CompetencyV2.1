import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useUserKnowledgeManager } from "modules/admin/frameworks/hooks/tpqi/useUserKnowledgeHooks";
import { KnowledgeApprovalStatus, UserKnowledge, UpdateUserKnowledgeDto } from "modules/admin/frameworks/types/tpqi/userKnowledgeTypes";
import { EditUserKnowledgeStatusModal } from "./UserKnowledgeModals";

export default function UserKnowledgePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UserKnowledge | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, userKnowledgeQuery, updateUserKnowledge } = useUserKnowledgeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openEditStatus = (row: UserKnowledge) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const confirmUpdateStatus = async (status: KnowledgeApprovalStatus | null) => {
    if (!selectedRow) return;

    const dto: UpdateUserKnowledgeDto = { approvalStatus: status ?? undefined } as UpdateUserKnowledgeDto;

    try {
      await updateUserKnowledge.mutateAsync({ id: selectedRow.id, data: dto });
      handleToast("Status updated successfully", "success");
      closeModal();

      await userKnowledgeQuery.refetch();
      setRefreshTick((t) => t + 1);
    } catch (err: any) {
      handleToast(`Failed to update status: ${err?.message || ""}`, "error");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: UserKnowledge } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "user.email",
        header: "User",
        cell: ({ row }: { row: { original: UserKnowledge } }) => row.original.userId ?? "—",
      },
      {
        accessorKey: "evidenceUrl",
        header: "Evidence",
        cell: ({ row }: { row: { original: UserKnowledge } }) => {
          const url = row.original.evidenceUrl;
          if (!url) return "—";
          return (
            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline max-w-[260px] block truncate" title={url}>
              {url}
            </a>
          );
        },
      },
      {
        accessorKey: "approvalStatus",
        header: "Status",
        cell: ({ row }: { row: { original: UserKnowledge } }) => {
          const status = row.original.approvalStatus ?? "—";
          const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
          const color =
            status === KnowledgeApprovalStatus.APPROVED ? " bg-green-100 text-green-800" : status === KnowledgeApprovalStatus.PENDING ? " bg-red-100 text-red-800" : " bg-gray-100 text-gray-800";
          return <span className={base + color}>{status}</span>;
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="flex justify-end">
            <FiSettings className="w-4 h-4" />
          </span>
        ),
        cell: ({ row }: { row: { original: UserKnowledge } }) => (
          <div className="flex justify-end">
            <RowActions onEdit={() => openEditStatus(row.original)} onDelete={undefined as any} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">User Knowledge</h1>
            <p className="mt-1 text-sm text-gray-600">View user–knowledge mappings and update status</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by user, knowledge, or status..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable<UserKnowledge>
          key={`${debouncedSearchText}-${refreshTick}`}
          resetTrigger={`${debouncedSearchText}-${refreshTick}`}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={10}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      <EditUserKnowledgeStatusModal
        isOpen={modalOpen}
        initialStatus={selectedRow?.approvalStatus as any}
        onClose={closeModal}
        onConfirm={confirmUpdateStatus}
        isLoading={updateUserKnowledge.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
