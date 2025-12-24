import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useOperationManager } from "modules/admin/rbac/hooks/useOperationManager";
import { Operation } from "modules/admin/rbac/types/operationTypes";
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);
  const refreshTable = () => {
    operationsQuery.refetch();
    setRefreshKey((prev) => prev + 1);
  };
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
      { id: 0, name, description: description || undefined, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(), assetId: 0 },
      {
        onSuccess: () => {
          handleToast("Operation created successfully!", "success");
          closeModal();
          operationsQuery.refetch();
          refreshTable();
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
          refreshTable();
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
        refreshTable();
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
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Operations</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Operation
            </div>
          </Button>

          <div className="relative">
            <Input type="text" placeholder="Search operations..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<Operation>
        key={debouncedSearchText}
        resetTrigger={`${debouncedSearchText}-${refreshKey}`}
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
