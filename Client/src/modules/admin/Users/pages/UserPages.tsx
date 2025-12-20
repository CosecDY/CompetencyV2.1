import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useUserManager } from "modules/admin/rbac/hooks/useUserManager";
import { User } from "modules/admin/rbac/types/userTypes";
import { AddEditUserModal, DeleteUserModal } from "./UserModals";

export default function UserPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const { fetchPage, createUser, updateUser, deleteUser } = useUserManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedUser(null);
    setModalType("add");
  };
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setModalType("edit");
  };
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalType("delete");
  };
  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  // Confirm actions
  const confirmAdd = (data: Partial<User>) => {
    createUser.mutate(data as User, {
      onSuccess: () => {
        handleToast("User created successfully", "success");
        closeModal();
      },
    });
  };

  const confirmEdit = (data: Partial<User>) => {
    if (!selectedUser) return;
    updateUser.mutate(
      { id: selectedUser.id, payload: data },
      {
        onSuccess: () => {
          handleToast("User updated successfully", "success");
          closeModal();
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    deleteUser.mutate(selectedUser.id, {
      onSuccess: () => {
        handleToast("User deleted successfully", "success");
        closeModal();
      },
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "email", header: "Email" },
      { accessorKey: "firstNameTH", header: "First Name (TH)" },
      { accessorKey: "lastNameTH", header: "Last Name (TH)" },
      { accessorKey: "firstNameEN", header: "First Name (EN)" },
      { accessorKey: "lastNameEN", header: "Last Name (EN)" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "line", header: "Line" },
      { accessorKey: "address", header: "Address" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }: { row: { original: User & { status?: "online" | "offline" } } }) => (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full mt-1 ${row.original.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
            <span>{row.original.status}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="float-right">
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: User } }) => (
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
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
          <h1 className="text-5xl font-semibold sm:mb-0 text-black">User List</h1>
          <div className="flex flex-col items-end space-y-2">
            <Button size="md" onClick={openAddModal}>
              <div className="flex items-center">
                <FiPlus className="mr-2" /> Add User
              </div>
            </Button>
            <div className="relative">
              <Input type="text" placeholder="Search users..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <DataTable<User>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex: number) => setPage(newPageIndex + 1)}
        />

        <AddEditUserModal
          isOpen={modalType === "add" || modalType === "edit"}
          mode={modalType === "edit" ? "edit" : "add"}
          initialData={selectedUser || {}}
          onClose={closeModal}
          onConfirm={(data) => (modalType === "add" ? confirmAdd(data) : confirmEdit(data))}
          isLoading={createUser.status === "pending" || updateUser.status === "pending"}
        />

        <DeleteUserModal
          isOpen={modalType === "delete"}
          userName={selectedUser ? `${selectedUser.firstNameTH || ""} ${selectedUser.lastNameTH || ""}`.trim() : undefined}
          onClose={closeModal}
          onConfirm={confirmDelete}
          isLoading={deleteUser.status === "pending"}
        />

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}
