import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useLevelManager } from "modules/admin/frameworks/hooks/sfia/useLevelHooks";
import { Level, CreateLevelDto, UpdateLevelDto } from "modules/admin/frameworks/types/sfia/levelTypes";
import { AddEditLevelModal, DeleteLevelModal } from "./LevelModals";

export default function LevelTablePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Reset page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, levelsQuery, createLevel, updateLevel, deleteLevel } = useLevelManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedLevel(null);
    setModalType("add");
  };
  const openEditModal = (lvl: Level) => {
    setSelectedLevel(lvl);
    setModalType("edit");
  };
  const openDeleteModal = (lvl: Level) => {
    setSelectedLevel(lvl);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedLevel(null);
  };

  // Confirm operations
  const confirmAdd = (levelName: string, codeJob: string) => {
    const dto: CreateLevelDto = {
      name: levelName || null,
      skillCode: codeJob || null,
    };
    createLevel.mutate(dto, {
      onSuccess: () => {
        handleToast("Level created successfully", "success");
        closeModal();
        levelsQuery.refetch();
      },
      onError: (error) => {
        handleToast("Failed to create: " + (error.message || ""), "error");
      },
    });
  };

  const confirmEdit = (levelName: string, codeJob: string) => {
    if (!selectedLevel) return;
    const dto: UpdateLevelDto = { name: levelName, skillCode: codeJob };
    updateLevel.mutate(
      { id: selectedLevel.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Level updated successfully", "success");
          closeModal();
          levelsQuery.refetch();
        },
        onError: (error) => {
          handleToast("Failed to update: " + (error.message || ""), "error");
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedLevel) return;
    deleteLevel.mutate(selectedLevel.id, {
      onSuccess: () => {
        handleToast("Level deleted successfully", "success");
        closeModal();
        levelsQuery.refetch();
      },
      onError: (error) => {
        handleToast("Failed to delete: " + (error.message || ""), "error");
      },
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Level Name" },
      { accessorKey: "skillCode", header: "Code Job" },
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Levels</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Level
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search levels..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
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
        initialCodeJob={selectedLevel?.skillCode || ""}
        onClose={closeModal}
        onConfirm={(name, code) => (modalType === "add" ? confirmAdd(name, code) : confirmEdit(name, code))}
        isLoading={createLevel.status === "pending" || updateLevel.status === "pending"}
      />

      <DeleteLevelModal isOpen={modalType === "delete"} levelName={selectedLevel?.name ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteLevel.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
