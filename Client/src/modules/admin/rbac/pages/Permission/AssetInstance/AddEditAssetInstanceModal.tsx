import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import React, { useState, useEffect } from "react";

interface AddEditAssetInstanceModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialAssetId?: number;
  initialRecordId: string;
  onClose: () => void;
  onConfirm: (assetId: number, recordId: string) => void;
  isLoading?: boolean;
}

export const AddEditAssetInstanceModal: React.FC<AddEditAssetInstanceModalProps> = ({ isOpen, mode, initialAssetId = 0, initialRecordId, onClose, onConfirm, isLoading = false }) => {
  const [assetId, setAssetId] = useState(initialAssetId);
  const [recordId, setRecordId] = useState(initialRecordId);

  useEffect(() => {
    setAssetId(initialAssetId);
    setRecordId(initialRecordId);
  }, [initialAssetId, initialRecordId]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Asset Instance" : "Edit Asset Instance"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(assetId, recordId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        {mode === "add" && (
          <div className="flex flex-col">
            <label className="block text-sm mb-1 ml-0.5">Asset ID</label>
            <Input type="number" value={assetId} className="!rounded-xl" onChange={(e) => setAssetId(Number(e.target.value))} disabled={isLoading} />
          </div>
        )}
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Record ID</label>
          <Input value={recordId} className="!rounded-xl" onChange={(e) => setRecordId(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteAssetInstanceModalProps {
  isOpen: boolean;
  recordId?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteAssetInstanceModal: React.FC<DeleteAssetInstanceModalProps> = ({ isOpen, recordId, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{recordId}”?</p>
  </Modal>
);
