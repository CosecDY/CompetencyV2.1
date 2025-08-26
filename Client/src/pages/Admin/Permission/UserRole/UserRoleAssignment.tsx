import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Common/ExportComponent";
import { useUserRoleManager } from "@Hooks/admin/rbac/useUserRoleManager";
import { UserRole, UserRoleAssignmentDto } from "@Types/admin/rbac/userRoleTypes";
import { AssignRoleModal, RevokeRoleModal } from "./UserRoleModals";
import { useRoleManager } from "@Hooks/admin/rbac/useRoleManager";

export default function UserRoleAssignmentPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"assign" | "revoke" | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const { rolesQuery } = useRoleManager({});
  const allRoles = rolesQuery.data?.data ?? [];
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, assignRolesToUser, revokeRoleFromUser } = useUserRoleManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAssignModal = (role?: UserRole) => {
    setSelectedUserRole(role ?? null);
    setModalType("assign");
  };
  const openRevokeModal = (role: UserRole) => {
    setSelectedUserRole(role);
    setModalType("revoke");
  };
  const closeModal = () => {
    setSelectedUserRole(null);
    setModalType(null);
  };

  // Confirmation handlers
  const confirmAssign = (userId: string, roleIds: number[]) => {
    const dto: UserRoleAssignmentDto = { userId, roleIds };
    assignRolesToUser.mutate(dto, {
      onSuccess: () => {
        handleToast("Roles assigned successfully!", "success");
        closeModal();
      },
    });
  };

  const confirmRevoke = (userId: string, roleId: number) => {
    revokeRoleFromUser.mutate(
      { userId, roleId },
      {
        onSuccess: () => {
          handleToast("Role revoked successfully!", "success");
          closeModal();
        },
      }
    );
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorFn: (row: UserRole) => row.userEmail ?? "", header: "User Email" },
      { accessorFn: (row: UserRole) => row.role?.name ?? "", header: "Role Name" },
      { accessorFn: (row: UserRole) => row.role?.description ?? "", header: "Description" },
      { accessorFn: (row: UserRole) => new Date(row.assignedAt).toLocaleString(), header: "Assigned At" },
      {
        id: "actions",
        header: () => (
          <span className="float-right">
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: UserRole } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openAssignModal(row.original)} onDelete={() => openRevokeModal(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">User Roles</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={() => openAssignModal()} className="flex items-center">
            <FiPlus className="mr-2" /> Assign Role
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search roles..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<UserRole>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AssignRoleModal
        isOpen={modalType === "assign"}
        selectedRole={selectedUserRole}
        allRoles={allRoles}
        onClose={closeModal}
        onConfirm={confirmAssign}
        isLoading={assignRolesToUser.status === "pending"}
      />

      <RevokeRoleModal isOpen={modalType === "revoke"} selectedRole={selectedUserRole} onClose={closeModal} onConfirm={confirmRevoke} isLoading={revokeRoleFromUser.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
