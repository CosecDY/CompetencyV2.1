// --- AddEditPermissionModal.tsx ---
import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditPermissionModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialOperationId: number | null;
  initialAssetId: number | null;
  onClose: () => void;
  onConfirm: (operationId: number, assetId: number) => void;
  isLoading?: boolean;
}

export const AddEditPermissionModal: React.FC<AddEditPermissionModalProps> = ({ isOpen, mode, initialOperationId, initialAssetId, onClose, onConfirm, isLoading = false }) => {
  const [operationId, setOperationId] = React.useState<number | null>(initialOperationId);
  const [assetId, setAssetId] = React.useState<number | null>(initialAssetId);

  React.useEffect(() => {
    if (isOpen) {
      setOperationId(initialOperationId);
      setAssetId(initialAssetId);
    }
  }, [isOpen, initialOperationId, initialAssetId]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Permission" : "Edit Permission"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={() => {
              if (!operationId || !assetId) return;
              onConfirm(operationId, assetId);
            }}
            isLoading={isLoading}
            loadingText={mode === "add" ? "Creating..." : "Saving..."}
          >
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label>Operation ID</label>
          <Input type="number" value={operationId ?? ""} onChange={(e) => setOperationId(Number(e.target.value))} disabled={isLoading} />
        </div>
        <div className="flex flex-col">
          <label>Asset ID</label>
          <Input type="number" value={assetId ?? ""} onChange={(e) => setAssetId(Number(e.target.value))} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeletePermissionModalProps {
  isOpen: boolean;
  permissionText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeletePermissionModal: React.FC<DeletePermissionModalProps> = ({ isOpen, permissionText, onClose, onConfirm, isLoading = false }) => (
  <Modal
    className="z-50"
    isOpen={isOpen}
    onClose={onClose}
    title="Confirm Delete"
    actions={
      <>
        <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton onClick={onConfirm} isLoading={isLoading} loadingText="Deleting..." className="!bg-red-600 !text-white hover:!bg-red-700">
          Delete
        </LoadingButton>
      </>
    }
  >
    <p>Are you sure you want to delete “{permissionText || "this permission"}”?</p>
  </Modal>
);
