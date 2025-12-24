import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useRoleManager } from "modules/admin/rbac/hooks/useRoleManager";
import { Role, CreateRoleDto, UpdateRoleDto } from "modules/admin/rbac/types/roleTypes";
import { AddEditRoleModal, DeleteRoleModal } from "./AddEditRoleModal";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function RolePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRoleInternal, setSelectedRoleInternal] = useState<Role | null>(null);
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

  const { fetchPage, rolesQuery, createRole, updateRole, deleteRole, currentPageQuery } = useRoleManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openAddModal = () => {
    setSelectedRoleInternal(null);

    setModalType("add");
  };
  const openEditModal = (role: Role) => {
    setSelectedRoleInternal(role);

    setModalType("edit");
  };
  const openDeleteModal = (role: Role) => {
    setSelectedRoleInternal(role);

    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRoleInternal(null);
  };

  const confirmAdd = (name: string, description?: string) => {
    const dto: CreateRoleDto = { name, description: description || undefined };
    createRole.mutate(dto, {
      onSuccess: () => {
        handleToast("Role created successfully!", "success");
        closeModal();
        rolesQuery.refetch();
        refreshTable();
      },
    });
  };

  const confirmEdit = (name: string, description?: string) => {
    if (!selectedRoleInternal) return;
    const dto: UpdateRoleDto = { name, description: description || undefined };
    updateRole.mutate(
      { id: selectedRoleInternal.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Role updated successfully!", "success");
          closeModal();
          rolesQuery.refetch();
          refreshTable();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRoleInternal) return;
    deleteRole.mutate(selectedRoleInternal.id, {
      onSuccess: () => {
        handleToast("Role deleted successfully!", "success");
        closeModal();
        rolesQuery.refetch();
        refreshTable();
      },
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Role Name" },
      { accessorKey: "description", header: "Description" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Role } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Roles</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Role
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search roles..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Role>
        key={debouncedSearchText}
        resetTrigger={`${debouncedSearchText}-${refreshKey}`}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditRoleModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialName={selectedRoleInternal?.name || ""}
        initialDescription={selectedRoleInternal?.description || ""}
        initialRoleId={selectedRoleInternal?.id ?? null}
        onClose={closeModal}
        onConfirm={(name, description) => (modalType === "add" ? confirmAdd(name, description) : confirmEdit(name, description))}
        isLoading={createRole.status === "pending" || updateRole.status === "pending"}
      />

      <DeleteRoleModal isOpen={modalType === "delete"} roleText={selectedRoleInternal?.name ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteRole.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
