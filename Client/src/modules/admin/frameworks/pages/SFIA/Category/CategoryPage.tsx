import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useCategoryManager } from "modules/admin/frameworks/hooks/sfia/useCategoryHooks";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "modules/admin/frameworks/types/sfia/categoryTypes";
import { AddEditCategoryModal, DeleteCategoryModal } from "./CategoryModals";
import type { ColumnDef } from "@tanstack/react-table";

export default function CategoryTablePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

  const { fetchPage, categoriesQuery, createCategory, updateCategory, deleteCategory } = useCategoryManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openAddModal = () => {
    setSelectedCategory(null);
    setModalType("add");
  };
  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setModalType("edit");
  };
  const openDeleteModal = (cat: Category) => {
    setSelectedCategory(cat);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedCategory(null);
  };

  const confirmAdd = (text: string, subId: number | null) => {
    const dto: CreateCategoryDto = { name: text || null, subcategoryId: subId };
    createCategory.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        categoriesQuery.refetch();
      },
      onError: (error) => handleToast("Failed to create: " + error.message, "error"),
    });
  };

  const confirmEdit = (text: string, subId: number | null) => {
    if (!selectedCategory) return;
    const dto: UpdateCategoryDto = { name: text, subcategoryId: subId };
    updateCategory.mutate(
      { id: selectedCategory.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          categoriesQuery.refetch();
        },
        onError: (error) => handleToast("Failed to update: " + error.message, "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedCategory) return;
    deleteCategory.mutate(selectedCategory.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        categoriesQuery.refetch();
      },
      onError: (error) => handleToast("Failed to delete: " + error.message, "error"),
    });
  };

  const columns = useMemo(
    () =>
      [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "name", header: "Category Text" },
        { accessorKey: "subcategoryId", header: "Subcategory ID" },
        {
          id: "actions",
          header: () => (
            <span style={{ float: "right" }}>
              <FiSettings />
            </span>
          ),
          cell: ({ row }: import("@tanstack/react-table").CellContext<Category, unknown>) => (
            <div className="text-right">
              <RowActions onEdit={() => openEditModal(row.original)} onDelete={() => openDeleteModal(row.original)} />
            </div>
          ),
        },
      ] as ColumnDef<Category>[],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Categories</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Category
          </Button>
          <div className="relative">
            <Input placeholder="Search categories..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Category>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      <AddEditCategoryModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCategoryText={selectedCategory?.name || ""}
        initialSubcategoryId={selectedCategory?.subcategoryId ?? null}
        subcategoryOptions={[] /* pass real options */}
        onClose={closeModal}
        onConfirm={(text, subId) => (modalType === "add" ? confirmAdd(text, subId) : confirmEdit(text, subId))}
        isLoading={createCategory.status === "pending" || updateCategory.status === "pending"}
      />

      <DeleteCategoryModal
        isOpen={modalType === "delete"}
        categoryText={selectedCategory?.name ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteCategory.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
