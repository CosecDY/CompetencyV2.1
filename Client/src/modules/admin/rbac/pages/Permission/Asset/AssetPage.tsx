import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useAssetManager } from "modules/admin/rbac/hooks/useAssetManager";
import { Asset, CreateAssetDto, UpdateAssetDto } from "modules/admin/rbac/types/assetTypes";
import { AddEditAssetModal, DeleteAssetModal } from "./AddEditAssetModal";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function AssetPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const refreshTable = () => {
    assetsQuery.refetch();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, assetsQuery, createAsset, updateAsset, deleteAsset } = useAssetManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openAddModal = () => {
    setSelectedAsset(null);
    setModalType("add");
  };
  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalType("edit");
  };
  const openDeleteModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedAsset(null);
  };

  const confirmAdd = (tableName: string, description?: string) => {
    const dto: CreateAssetDto = { tableName, description: description || undefined };
    createAsset.mutate(dto, {
      onSuccess: () => {
        handleToast("Asset created successfully!", "success");
        closeModal();
        assetsQuery.refetch();
        refreshTable();
      },
    });
  };

  const confirmEdit = (tableName: string, description?: string) => {
    if (!selectedAsset) return;
    const dto: UpdateAssetDto = { tableName, description: description || undefined };
    updateAsset.mutate(
      { id: selectedAsset.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Asset updated successfully!", "success");
          closeModal();
          assetsQuery.refetch();
          refreshTable();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedAsset) return;
    deleteAsset.mutate(selectedAsset.id, {
      onSuccess: () => {
        handleToast("Asset deleted successfully!", "success");
        closeModal();
        assetsQuery.refetch();
        refreshTable();
      },
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "tableName", header: "Table Name" },
      { accessorKey: "description", header: "Description" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Asset } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Assets</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<FiPlus />}>
            Add Asset
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search assets..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Asset>
        key={debouncedSearchText}
        resetTrigger={`${debouncedSearchText}-${refreshKey}`}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditAssetModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialTableName={selectedAsset?.tableName || ""}
        initialDescription={selectedAsset?.description || ""}
        initialAssetId={selectedAsset?.id ?? null}
        onClose={closeModal}
        onConfirm={(tableName, description) => (modalType === "add" ? confirmAdd(tableName, description) : confirmEdit(tableName, description))}
        isLoading={createAsset.status === "pending" || updateAsset.status === "pending"}
      />

      <DeleteAssetModal isOpen={modalType === "delete"} assetText={selectedAsset?.tableName ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteAsset.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
