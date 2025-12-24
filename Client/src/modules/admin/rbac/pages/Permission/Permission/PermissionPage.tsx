import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { usePermissionManager } from "modules/admin/rbac/hooks/usePermissionManager";
import { Permission, CreatePermissionDto, UpdatePermissionDto } from "modules/admin/rbac/types/permissionTypes";
import { AddEditPermissionModal, DeletePermissionModal } from "./PermissionModals";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function PermissionPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const refreshTable = () => {
    currentPageQuery.refetch();
    setRefreshKey((prev) => prev + 1);
  };

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, createPermission, updatePermission, deletePermission, currentPageQuery } = usePermissionManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedPermission(null);
    setModalType("add");
  };
  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalType("edit");
  };
  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalType("delete");
  };
  const closeModal = () => {
    setSelectedPermission(null);
    setModalType(null);
  };

  // Confirmation handlers
  const confirmAdd = (operationId: number, assetId: number) => {
    const dto: CreatePermissionDto = { operationId, assetId };
    createPermission.mutate(dto, {
      onSuccess: () => {
        handleToast("Permission created successfully!", "success");
        closeModal();
        refreshTable();
      },
    });
  };

  const confirmEdit = (operationId: number, assetId: number) => {
    if (!selectedPermission) return;
    const dto: UpdatePermissionDto = { operationId, assetId };
    updatePermission.mutate(
      { id: selectedPermission.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Permission updated successfully!", "success");
          closeModal();
          refreshTable();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedPermission) return;
    deletePermission.mutate(selectedPermission.id, {
      onSuccess: () => {
        handleToast("Permission deleted successfully!", "success");
        closeModal();
        refreshTable();
      },
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorFn: (row: Permission) => row.operation?.name ?? "", header: "Operation" },
      { accessorFn: (row: Permission) => row.asset?.description ?? "", header: "Asset" },
      { accessorFn: (row: Permission) => new Date(row.createdAt).toLocaleString(), header: "Created At" },
      { accessorFn: (row: Permission) => new Date(row.updatedAt).toLocaleString(), header: "Updated At" },

      {
        id: "actions",
        header: () => (
          <span className="float-right">
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Permission } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Permissions</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Permission
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search permissions..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Permission>
        key={debouncedSearchText}
        resetTrigger={`${debouncedSearchText}-${refreshKey}`}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditPermissionModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialOperationId={selectedPermission?.operation?.id ?? null}
        initialAssetId={selectedPermission?.asset?.id ?? null}
        onClose={closeModal}
        onConfirm={(operationId, assetId) => (modalType === "add" ? confirmAdd(operationId, assetId) : confirmEdit(operationId, assetId))}
        isLoading={createPermission.status === "pending" || updatePermission.status === "pending"}
      />

      <DeletePermissionModal
        isOpen={modalType === "delete"}
        permissionText={`${selectedPermission?.operation?.name || ""} - ${selectedPermission?.asset?.description || ""}`}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deletePermission.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
