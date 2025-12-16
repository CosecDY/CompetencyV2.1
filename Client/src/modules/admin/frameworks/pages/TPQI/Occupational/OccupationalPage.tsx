import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useOccupationalManager } from "modules/admin/frameworks/hooks/tpqi/useOccupationalHooks";
import { Occupational, CreateOccupationalDto, UpdateOccupationalDto } from "modules/admin/frameworks/types/tpqi/occupationalTypes";
import { AddEditOccupationalModal, DeleteOccupationalModal } from "./OccupationalModals";

export default function OccupationalPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedOcc, setSelectedOcc] = useState<Occupational | null>(null);
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

  const { fetchPage, occupationalsQuery, createOccupational, updateOccupational, deleteOccupational } = useOccupationalManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal controls
  const openAddModal = () => {
    setSelectedOcc(null);
    setModalType("add");
  };
  const openEditModal = (o: Occupational) => {
    setSelectedOcc(o);
    setModalType("edit");
  };
  const openDeleteModal = (o: Occupational) => {
    setSelectedOcc(o);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedOcc(null);
  };

  // confirms
  const confirmAdd = (name: string, categoryId: number | null) => {
    const dto: CreateOccupationalDto = { name: name || null, categoryId: categoryId ?? null } as any;
    createOccupational.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        occupationalsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (name: string, categoryId: number | null) => {
    if (!selectedOcc) return;
    const dto: UpdateOccupationalDto = { name: name || null, categoryId: categoryId ?? null } as any;
    updateOccupational.mutate(
      { id: selectedOcc.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          occupationalsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedOcc) return;
    deleteOccupational.mutate(selectedOcc.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        occupationalsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Occupational name" },
      // If your API returns category name, you can add:
      // { accessorKey: "categoryName", header: "Category" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Occupational } }) => (
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
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Occupationals</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Occupational
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search occupationals..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<Occupational>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditOccupationalModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedOcc?.name || ""}
        initialCategoryId={(selectedOcc as any)?.categoryId ?? null}
        onClose={closeModal}
        onConfirm={(name, catId) => (modalType === "add" ? confirmAdd(name, catId) : confirmEdit(name, catId))}
        isLoading={createOccupational.status === "pending" || updateOccupational.status === "pending"}
      />

      <DeleteOccupationalModal
        isOpen={modalType === "delete"}
        occupationalText={selectedOcc?.name ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteOccupational.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
