import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useClDetailManager } from "modules/admin/frameworks/hooks/tpqi/useClDetailHooks";
import { ClDetail, CreateClDetailDto, UpdateClDetailDto } from "modules/admin/frameworks/types/tpqi/clDetailTypes";
import { AddEditClDetailModal, DeleteClDetailModal } from "./CLDetailModals";

export default function ClDetailPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<ClDetail | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText.trim()), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, clDetailsQuery, createClDetail, updateClDetail, deleteClDetail } = useClDetailManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modals open/close
  const openAdd = () => {
    setSelected(null);
    setModalType("add");
  };
  const openEdit = (row: ClDetail) => {
    setSelected(row);
    setModalType("edit");
  };
  const openDelete = (row: ClDetail) => {
    setSelected(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // Confirm handlers
  const confirmAdd = (payload: { careerLevelId: number; description: string }) => {
    const dto: CreateClDetailDto = {
      careerLevelId: payload.careerLevelId,
      description: payload.description,
    };

    createClDetail.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        clDetailsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (payload: { careerLevelId: number; description: string }) => {
    if (!selected) return;

    const dto: UpdateClDetailDto = {
      careerLevelId: payload.careerLevelId,
      description: payload.description,
    };

    updateClDetail.mutate(
      { id: selected.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          clDetailsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selected) return;

    deleteClDetail.mutate(selected.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        clDetailsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", size: 60 },
      {
        id: "careerName",
        header: "Career Name",
        cell: ({ row }: { row: { original: ClDetail } }) => row.original?.careerLevel?.career?.name ?? "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: { row: { original: ClDetail } }) => <div className="whitespace-pre-wrap">{row.original?.description ?? "-"}</div>,
      },
      {
        id: "levelName",
        header: "Level Name",
        cell: ({ row }: { row: { original: ClDetail } }) => row.original?.careerLevel?.level?.name ?? "-",
        size: 120,
      },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: ClDetail } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openEdit(row.original)} onDelete={() => openDelete(row.original)} />
          </div>
        ),
        size: 120,
      },
    ],
    []
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Career Details</h1>
          <p className="mt-1 text-sm text-gray-600">Manage career Details</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAdd} className="flex items-center">
            <FiPlus className="mr-2" /> Add Detail
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search by description or level..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable<ClDetail>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns as any}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditClDetailModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCareerLevelId={selected?.careerLevelId ?? null}
        initialDescription={selected?.description ?? ""}
        onClose={closeModal}
        onConfirm={(payload) => (modalType === "add" ? confirmAdd(payload) : confirmEdit(payload))}
        isLoading={createClDetail.isPending || updateClDetail.isPending}
      />

      <DeleteClDetailModal
        isOpen={modalType === "delete"}
        label={
          selected ? `"${selected.description?.slice(0, 80)}"${selected.description && selected.description.length > 80 ? "..." : ""} — Level ${selected.careerLevel?.level?.name ?? "-"}` : undefined
        }
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteClDetail.isPending}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
