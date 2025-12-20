import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useLevelManager } from "modules/admin/frameworks/hooks/tpqi/useLevelHooks";
import { Level, CreateLevelDto, UpdateLevelDto } from "modules/admin/frameworks/types/tpqi/levelTypes";
import { AddEditLevelModal, DeleteLevelModal } from "./LevelModals";

export default function LevelPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, levelsQuery, createLevel, updateLevel, deleteLevel } = useLevelManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal controls
  const openAddModal = () => {
    setSelectedLevel(null);
    setModalType("add");
  };
  const openEditModal = (l: Level) => {
    setSelectedLevel(l);
    setModalType("edit");
  };
  const openDeleteModal = (l: Level) => {
    setSelectedLevel(l);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedLevel(null);
  };

  // confirms
  const confirmAdd = (name: string, order: number | null) => {
    const dto: CreateLevelDto = { name: name || null, order: order ?? null } as any;
    createLevel.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        levelsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (name: string, order: number | null) => {
    if (!selectedLevel) return;
    const dto: UpdateLevelDto = { name: name || null, order: order ?? null } as any;
    updateLevel.mutate(
      { id: selectedLevel.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          levelsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedLevel) return;
    deleteLevel.mutate(selectedLevel.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        levelsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Level name" },
      // If your API includes order / rank:
      // { accessorKey: "order", header: "Order" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Level } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openEditModal(row.original)} onDelete={() => openDeleteModal(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Levels</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal}>
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Level
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search levels..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<Level>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditLevelModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialLevelName={selectedLevel?.name || ""}
        initialId={(selectedLevel as any)?.order ?? null}
        onClose={closeModal}
        onConfirm={(name, order) => (modalType === "add" ? confirmAdd(name, order) : confirmEdit(name, order))}
        isLoading={createLevel.status === "pending" || updateLevel.status === "pending"}
      />

      <DeleteLevelModal isOpen={modalType === "delete"} levelText={selectedLevel?.name ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteLevel.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
