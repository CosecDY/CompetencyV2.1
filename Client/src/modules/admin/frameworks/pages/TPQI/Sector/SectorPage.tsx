import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useSectorManager } from "modules/admin/frameworks/hooks/tpqi/useSectorHooks";
import { Sector, CreateSectorDto, UpdateSectorDto } from "modules/admin/frameworks/types/tpqi/sectorTypes";
import { AddEditSectorModal, DeleteSectorModal } from "./SectorModals";

export default function SectorPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // Reset paging on new search
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, sectorsQuery, createSector, updateSector, deleteSector } = useSectorManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modals
  const openAddModal = () => {
    setSelectedSector(null);
    setModalType("add");
  };
  const openEditModal = (s: Sector) => {
    setSelectedSector(s);
    setModalType("edit");
  };
  const openDeleteModal = (s: Sector) => {
    setSelectedSector(s);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedSector(null);
  };

  // Confirm ops
  const confirmAdd = (name: string, categoryId: number | null) => {
    const dto: CreateSectorDto = { name: name || null, categoryId: categoryId ?? null } as any;
    createSector.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        sectorsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (name: string, categoryId: number | null) => {
    if (!selectedSector) return;
    const dto: UpdateSectorDto = { name: name || null, categoryId: categoryId ?? null } as any;
    updateSector.mutate(
      { id: selectedSector.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          sectorsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedSector) return;
    deleteSector.mutate(selectedSector.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        sectorsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Sector name" },
      // If your sector has a category name, you can add it:
      // { accessorKey: "categoryName", header: "Category" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Sector } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Sectors</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal}>
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Sector
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search sectors..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Sector>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditSectorModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedSector?.name || ""}
        initialCategoryId={(selectedSector as any)?.categoryId ?? null}
        onClose={closeModal}
        onConfirm={(name, catId) => (modalType === "add" ? confirmAdd(name, catId) : confirmEdit(name, catId))}
        isLoading={createSector.status === "pending" || updateSector.status === "pending"}
      />

      <DeleteSectorModal isOpen={modalType === "delete"} sectorText={selectedSector?.name ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteSector.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
