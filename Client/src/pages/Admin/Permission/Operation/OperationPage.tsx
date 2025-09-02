import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Common/ExportComponent";
import { useOperationManager } from "@Hooks/admin/rbac/useOperationManager";
import { Operation } from "@Types/admin/rbac/operationTypes";
import { AddEditOperationModal, DeleteOperationModal } from "./AddEditOperationModal";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function OperationPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
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

  const { fetchPage, operationsQuery, createOperation, updateOperation, deleteOperation } = useOperationManager({ page, perPage }, handleToast);

  const openAddModal = () => {
    setSelectedOperation(null);
    setModalType("add");
  };
  const openEditModal = (operation: Operation) => {
    setSelectedOperation(operation);
    setModalType("edit");
  };
  const openDeleteModal = (operation: Operation) => {
    setSelectedOperation(operation);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedOperation(null);
  };

  const confirmAdd = (name: string, description?: string) => {
    createOperation.mutate(
      { id: 0, name, description: description || undefined, updatedAt: new Date().toISOString() },
      {
        onSuccess: () => {
          handleToast("Operation created successfully!", "success");
          closeModal();
          operationsQuery.refetch();
        },
      }
    );
  };

  const confirmEdit = (name: string, description?: string) => {
    if (!selectedOperation) return;
    updateOperation.mutate(
      { id: selectedOperation.id, data: { name, description: description || undefined } },
      {
        onSuccess: () => {
          handleToast("Operation updated successfully!", "success");
          closeModal();
          operationsQuery.refetch();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedOperation) return;
    deleteOperation.mutate(selectedOperation.id, {
      onSuccess: () => {
        handleToast("Operation deleted successfully!", "success");
        closeModal();
        operationsQuery.refetch();
      },
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Operation Name" },
      { accessorKey: "description", header: "Description" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Operation } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Operations</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Operation
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search operations..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Operation>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditOperationModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialName={selectedOperation?.name || ""}
        initialDescription={selectedOperation?.description || ""}
        initialOperationId={selectedOperation?.id ?? null}
        onClose={closeModal}
        onConfirm={(name, description) => (modalType === "add" ? confirmAdd(name, description) : confirmEdit(name, description))}
        isLoading={createOperation.status === "pending" || updateOperation.status === "pending"}
      />

      <DeleteOperationModal
        isOpen={modalType === "delete"}
        operationText={selectedOperation?.name ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteOperation.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
