import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useDescriptionManager } from "modules/admin/frameworks/hooks/sfia/useDescriptionHooks";
import { Description, CreateDescriptionDto, UpdateDescriptionDto } from "modules/admin/frameworks/types/sfia/descriptionTypes";
import { AddEditDescriptionModal, DeleteDescriptionModal } from "./DescriptionModals";
import type { ColumnDef } from "@tanstack/react-table";

export default function DescriptionTablePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);
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

  const { fetchPage, descriptionsQuery, createDescription, updateDescription, deleteDescription } = useDescriptionManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedDescription(null);
    setModalType("add");
  };
  const openEditModal = (desc: Description) => {
    setSelectedDescription(desc);
    setModalType("edit");
  };
  const openDeleteModal = (desc: Description) => {
    setSelectedDescription(desc);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedDescription(null);
  };

  // Confirm operations
  const confirmAdd = (text: string) => {
    const dto: CreateDescriptionDto = { text: text || null };
    createDescription.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        descriptionsQuery.refetch();
      },
      onError: (error) => {
        handleToast("Failed to create: " + error.message, "error");
      },
    });
  };

  const confirmEdit = (text: string) => {
    if (!selectedDescription) return;
    const dto: UpdateDescriptionDto = { text: text };
    updateDescription.mutate(
      { id: selectedDescription.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          descriptionsQuery.refetch();
        },
        onError: (error) => {
          handleToast("Failed to update: " + error.message, "error");
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedDescription) return;
    deleteDescription.mutate(selectedDescription.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        descriptionsQuery.refetch();
      },
      onError: (error) => {
        handleToast("Failed to delete: " + error.message, "error");
      },
    });
  };

  // Table columns
  const columns = useMemo(
    () =>
      [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "text", header: "Description Text" },
        {
          id: "actions",
          header: () => (
            <span style={{ float: "right" }}>
              <FiSettings />
            </span>
          ),
          cell: ({ row }: import("@tanstack/react-table").CellContext<Description, unknown>) => (
            <div className="text-right">
              <RowActions onEdit={() => openEditModal(row.original)} onDelete={() => openDeleteModal(row.original)} />
            </div>
          ),
        },
      ] as ColumnDef<Description>[],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Descriptions</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal}>
            <div className="flex items-center">
              <FiPlus className="mr-2" />
              <span>Add Description</span>
            </div>
          </Button>

          <div className="relative">
            <Input type="text" placeholder="Search descriptions..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Description>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditDescriptionModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedDescription?.text || ""}
        onClose={closeModal}
        onConfirm={(text) => (modalType === "add" ? confirmAdd(text) : confirmEdit(text))}
        isLoading={createDescription.status === "pending" || updateDescription.status === "pending"}
      />

      <DeleteDescriptionModal
        isOpen={modalType === "delete"}
        descriptionText={selectedDescription?.text ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteDescription.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
