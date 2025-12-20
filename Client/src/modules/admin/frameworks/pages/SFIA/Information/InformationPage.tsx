import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useInformationManager } from "modules/admin/frameworks/hooks/sfia/useInformationHooks";
import { Information, InformationApprovalStatus, UpdateInformationDto } from "modules/admin/frameworks/types/sfia/informationTypes";
import { EditInformationStatusModal } from "./InformationModals";

export default function InformationPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Information | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, informationItemQuery, updateInformation } = useInformationManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openEditStatus = (row: Information) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const confirmUpdateStatus = async (status: InformationApprovalStatus | null) => {
    if (!selectedRow) return;

    const dto: UpdateInformationDto = { approvalStatus: status } as UpdateInformationDto;

    try {
      await updateInformation.mutateAsync({ id: selectedRow.id, data: dto });
      handleToast("Status updated successfully", "success");
      closeModal();
      await informationItemQuery.refetch();
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
        cell: ({ row }: { row: { original: Information } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }: { row: { original: Information } }) => {
          const userId = row.original.userId;

          return userId || "—";
        },
      },
      {
        accessorKey: "evidenceUrl",
        header: "Evidence",
        cell: ({ row }: { row: { original: Information } }) => {
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
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: { row: { original: Information } }) => {
          const d = new Date(row.original.createdAt);
          return isNaN(d.getTime()) ? "—" : d.toLocaleString();
        },
      },
      {
        accessorKey: "approvalStatus",
        header: "Status",
        cell: ({ row }: { row: { original: Information } }) => {
          const status = row.original.approvalStatus ?? "—";
          const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
          const color =
            status === InformationApprovalStatus.APPROVED
              ? " bg-green-100 text-green-800"
              : status === InformationApprovalStatus.NOT_APPROVED
              ? " bg-red-100 text-red-800"
              : " bg-gray-100 text-gray-800";
          return <span className={base + color}>{String(status)}</span>;
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="flex justify-end">
            <FiSettings className="w-4 h-4" />
          </span>
        ),
        cell: ({ row }: { row: { original: Information } }) => (
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
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg sfocus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable<Information>
          key={`${debouncedSearchText}-${refreshTick}`}
          resetTrigger={`${debouncedSearchText}-${refreshTick}`}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={10}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      <EditInformationStatusModal
        isOpen={modalOpen}
        initialStatus={selectedRow?.approvalStatus as any}
        onClose={closeModal}
        onConfirm={confirmUpdateStatus}
        isLoading={updateInformation.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
