import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import React, { useState, useEffect } from "react";

interface AddEditAssetModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialTableName: string;
  initialDescription: string;
  initialAssetId: number | null;
  onClose: () => void;
  onConfirm: (tableName: string, description?: string) => void;
  isLoading?: boolean;
}

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({ isOpen, mode, initialTableName, initialDescription, onClose, onConfirm, isLoading = false }) => {
  const [tableName, setTableName] = useState(initialTableName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTableName(initialTableName);
  }, [initialTableName]);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Asset" : "Edit Asset"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(tableName, description)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Table Name</label>
          <Input value={tableName} className="!rounded-xl" onChange={(e) => setTableName(e.target.value)} disabled={isLoading} />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description</label>
          <Input value={description} className="!rounded-xl" onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteAssetModalProps {
  isOpen: boolean;
  assetText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteAssetModal: React.FC<DeleteAssetModalProps> = ({ isOpen, assetText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{assetText}”?</p>
  </Modal>
);
