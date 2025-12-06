import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Common/ExportComponent";
import { useAssetInstanceManager } from "@Hooks/admin/rbac/useAssetInstanceManager";
import { AssetInstance } from "@Types/admin/rbac/assetInstanceTypes";
import { AddEditAssetInstanceModal, DeleteAssetInstanceModal } from "./AddEditAssetInstanceModal";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function AssetInstancePage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<AssetInstance | null>(null);
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

  const { fetchPage, assetInstancesQuery, createInstance, updateInstance, deleteInstance } = useAssetInstanceManager({ page, perPage, search: debouncedSearchText }, handleToast);

  const openAddModal = () => {
    setSelectedInstance(null);
    setModalType("add");
  };

  const openEditModal = (instance: AssetInstance) => {
    setSelectedInstance(instance);
    setModalType("edit");
  };

  const openDeleteModal = (instance: AssetInstance) => {
    setSelectedInstance(instance);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedInstance(null);
  };

  const confirmAdd = (assetId: number, recordId: string) => {
    createInstance.mutate(
      { assetId, recordId },
      {
        onSuccess: () => {
          handleToast("AssetInstance created successfully!", "success");
          closeModal();
          assetInstancesQuery.refetch();
        },
      }
    );
  };

  const confirmEdit = (newRecordId: string) => {
    if (!selectedInstance) return;
    updateInstance.mutate(
      { id: selectedInstance.id, data: { newRecordId: newRecordId } },
      {
        onSuccess: () => {
          handleToast("AssetInstance updated successfully!", "success");
          closeModal();
          assetInstancesQuery.refetch();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedInstance) return;
    deleteInstance.mutate(
      { assetId: selectedInstance.assetId, recordId: selectedInstance.recordId },
      {
        onSuccess: () => {
          handleToast("AssetInstance deleted successfully!", "success");
          closeModal();
          assetInstancesQuery.refetch();
        },
      }
    );
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "assetId", header: "Asset ID" },
      { accessorKey: "recordId", header: "Record ID" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: AssetInstance } }) => (
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
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Asset Instances</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Instance
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search recordId..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<AssetInstance>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditAssetInstanceModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialAssetId={selectedInstance?.assetId ?? 0}
        initialRecordId={selectedInstance?.recordId ?? ""}
        onClose={closeModal}
        onConfirm={(assetId, recordId) => (modalType === "add" ? confirmAdd(assetId, recordId) : confirmEdit(recordId))}
        isLoading={createInstance.status === "pending" || updateInstance.status === "pending"}
      />

      <DeleteAssetInstanceModal
        isOpen={modalType === "delete"}
        recordId={selectedInstance?.recordId ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteInstance.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
