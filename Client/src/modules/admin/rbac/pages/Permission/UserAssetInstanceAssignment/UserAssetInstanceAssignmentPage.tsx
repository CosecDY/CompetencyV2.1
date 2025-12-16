import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useUserAssetInstanceManager } from "modules/admin/rbac/hooks/useUserAssetInstanceManager";
import { useAssetInstanceManager } from "modules/admin/rbac/hooks/useAssetInstanceManager";
import { UserAssetInstance, UserAssetInstanceAssignmentDto } from "modules/admin/rbac/types/userAssetInstanceTypes";
import { AssignAssetModal, RevokeAssetModal } from "./UserAssetInstanceModals";
import { AdminLayout } from "@Layouts/AdminLayout";

export default function UserAssetInstanceAssignmentPage() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalType, setModalType] = useState<"assign" | "revoke" | null>(null);
  const [selectedAssetInstance, setSelectedAssetInstance] = useState<UserAssetInstance | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  // Use a hook to manage user-asset instance assignments
  const { fetchPage, assignAssetInstancesToUser, revokeAssetInstanceFromUser } = useUserAssetInstanceManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Use a separate hook to fetch ALL available asset instances
  const { assetInstancesQuery } = useAssetInstanceManager();
  const availableAssets = assetInstancesQuery.data?.data || [];

  // Modal handlers
  const openAssignModal = (assetInstance?: UserAssetInstance) => {
    setSelectedAssetInstance(assetInstance ?? null);
    setModalType("assign");
  };
  const openRevokeModal = (assetInstance: UserAssetInstance) => {
    setSelectedAssetInstance(assetInstance);
    setModalType("revoke");
  };
  const closeModal = () => {
    setSelectedAssetInstance(null);
    setModalType(null);
  };

  // Confirmation handlers
  const confirmAssign = (userId: string, assetInstanceIds: number[]) => {
    const dto: UserAssetInstanceAssignmentDto = { userId, assetInstanceIds };
    assignAssetInstancesToUser.mutate(dto, {
      onSuccess: () => {
        handleToast("Asset Instances assigned successfully!", "success");
        closeModal();
      },
    });
  };

  const confirmRevoke = (userId: string, assetInstanceId: number) => {
    revokeAssetInstanceFromUser.mutate(
      { userId, assetInstanceId },
      {
        onSuccess: () => {
          handleToast("Asset Instance revoked successfully!", "success");
          closeModal();
        },
      }
    );
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorFn: (row: UserAssetInstance) => row.userId, header: "User ID" },
      { accessorFn: (row: UserAssetInstance) => row.assetInstance?.recordId ?? "", header: "Asset Record ID" },
      { accessorFn: (row: UserAssetInstance) => row.assetInstance?.assetName ?? "", header: "Asset Name" },
      { accessorFn: (row: UserAssetInstance) => new Date(row.assignedAt).toLocaleString(), header: "Assigned At" },
      {
        id: "actions",
        header: () => (
          <span className="float-right">
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: UserAssetInstance } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openAssignModal(row.original)} onDelete={() => openRevokeModal(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">User Asset Instances</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={() => openAssignModal()} className="flex items-center">
            <FiPlus className="mr-2" /> Assign Asset
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search asset instances..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<UserAssetInstance>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AssignAssetModal
        isOpen={modalType === "assign"}
        selectedAsset={selectedAssetInstance}
        availableAssets={availableAssets}
        onClose={closeModal}
        onConfirm={confirmAssign}
        isLoading={assignAssetInstancesToUser.status === "pending"}
      />

      <RevokeAssetModal
        isOpen={modalType === "revoke"}
        selectedAsset={selectedAssetInstance}
        onClose={closeModal}
        onConfirm={confirmRevoke}
        isLoading={revokeAssetInstanceFromUser.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
