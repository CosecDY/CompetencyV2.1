import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useSubcategoryManager } from "modules/admin/frameworks/hooks/sfia/useSubcategoryHooks";
import { Subcategory, CreateSubcategoryDto, UpdateSubcategoryDto } from "modules/admin/frameworks/types/sfia/subcategoryTypes";
import { AddEditSubcategoryModal, DeleteSubcategoryModal } from "./SubcategoryModals";

export default function SubcategoryTablePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
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

  const { fetchPage, subcategoriesQuery, createSubcategory, updateSubcategory, deleteSubcategory } = useSubcategoryManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedSubcategory(null);
    setModalType("add");
  };
  const openEditModal = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    setModalType("edit");
  };
  const openDeleteModal = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedSubcategory(null);
  };

  // Confirm operations
  const confirmAdd = (text: string) => {
    const dto: CreateSubcategoryDto = { name: text || null };
    createSubcategory.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        subcategoriesQuery.refetch();
      },
      onError: (error) => {
        handleToast("Failed to create: " + (error.message || ""), "error");
      },
    });
  };

  const confirmEdit = (text: string) => {
    if (!selectedSubcategory) return;
    const dto: UpdateSubcategoryDto = { name: text };
    updateSubcategory.mutate(
      { id: selectedSubcategory.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          subcategoriesQuery.refetch();
        },
        onError: (error) => {
          handleToast("Failed to update: " + (error.message || ""), "error");
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedSubcategory) return;
    deleteSubcategory.mutate(selectedSubcategory.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        subcategoriesQuery.refetch();
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
      { accessorKey: "name", header: "Subcategory Text" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Subcategory } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Subcategories</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal}>
            <div className="flex items-center">
              <FiPlus className="mr-2" />
              Add Subcategory
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search subcategories..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Subcategory>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditSubcategoryModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedSubcategory?.name || ""}
        initialCategoryId={selectedSubcategory?.id ?? null}
        onClose={closeModal}
        onConfirm={(text) => (modalType === "add" ? confirmAdd(text) : confirmEdit(text))}
        isLoading={createSubcategory.status === "pending" || updateSubcategory.status === "pending"}
      />

      <DeleteSubcategoryModal
        isOpen={modalType === "delete"}
        subcategoryText={selectedSubcategory?.name ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteSubcategory.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
