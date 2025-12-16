import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useCareerLevelManager } from "modules/admin/frameworks/hooks/tpqi/useCareerLevelHooks";
import { CareerLevelView, CreateCareerLevelDto, UpdateCareerLevelDto } from "modules/admin/frameworks/types/tpqi/careerLevelTypes";
import { AddEditCareerLevelModal, DeleteCareerLevelModal } from "./CareerLevelModals";

export default function CareerLevelPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedCL, setSelectedCL] = useState<CareerLevelView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset page on search
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, careerLevelsQuery, createCareerLevel, updateCareerLevel, deleteCareerLevel } = useCareerLevelManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal controls
  const openAddModal = () => {
    setSelectedCL(null);
    setModalType("add");
  };
  const openEditModal = (cl: CareerLevelView) => {
    setSelectedCL(cl);
    setModalType("edit");
  };
  const openDeleteModal = (cl: CareerLevelView) => {
    setSelectedCL(cl);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedCL(null);
  };

  // confirms
  const confirmAdd = (careerId: number | null, levelId: number | null) => {
    if (careerId == null || levelId == null) {
      return handleToast("กรุณากรอก Career ID และ Level ID ให้ครบ", "error");
    }
    const dto: CreateCareerLevelDto = { careerId, levelId } as any;
    createCareerLevel.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        careerLevelsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (careerId: number | null, levelId: number | null) => {
    if (!selectedCL) return;
    const dto: UpdateCareerLevelDto = {};
    if (careerId != null) dto.careerId = careerId;
    if (levelId != null) dto.levelId = levelId;
    updateCareerLevel.mutate(
      { id: selectedCL.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          careerLevelsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedCL) return;
    deleteCareerLevel.mutate(selectedCL.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        careerLevelsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: CareerLevelView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "career.name",
        header: "Career name",
        cell: ({ row }: { row: { original: CareerLevelView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.career?.name || "No career name"}>
              {row.original.career?.name || "—"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "level.name",
        header: "Level name",
        cell: ({ row }: { row: { original: CareerLevelView } }) => (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Level {row.original.level?.name || "—"}</span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="flex justify-end">
            <FiSettings className="w-4 h-4" />
          </span>
        ),
        cell: ({ row }: { row: { original: CareerLevelView } }) => (
          <div className="flex justify-end">
            <RowActions onEdit={() => openEditModal(row.original)} onDelete={() => openDeleteModal(row.original)} />
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Career Levels</h1>
            <p className="mt-1 text-sm text-gray-600">Manage career levels</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Button size="md" onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <FiPlus className="w-4 h-4" />
              Add Career Level
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by career, level..."
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
        <DataTable<CareerLevelView>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage} // must return { data: CareerLevelView[]; total }
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      <AddEditCareerLevelModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCareerId={selectedCL?.career?.id ?? null}
        initialLevelId={selectedCL?.level?.id ?? null}
        onClose={closeModal}
        onConfirm={(careerId, levelId) => (modalType === "add" ? confirmAdd(careerId, levelId) : confirmEdit(careerId, levelId))}
        isLoading={createCareerLevel.status === "pending" || updateCareerLevel.status === "pending"}
      />

      <DeleteCareerLevelModal
        isOpen={modalType === "delete"}
        label={selectedCL ? `${selectedCL.career?.name ?? "Unknown Career"} / Level ${selectedCL.level?.name ?? "-"}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteCareerLevel.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
