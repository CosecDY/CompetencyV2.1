import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import React, { useState, useEffect } from "react";

interface AddEditOperationModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialName: string;
  initialDescription: string;
  initialOperationId: number | null;
  onClose: () => void;
  onConfirm: (name: string, description?: string) => void;
  isLoading?: boolean;
}

export const AddEditOperationModal: React.FC<AddEditOperationModalProps> = ({ isOpen, mode, initialName, initialDescription, onClose, onConfirm, isLoading = false }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Operation" : "Edit Operation"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(name, description)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Operation Name</label>
          <Input value={name} className="!rounded-xl" onChange={(e) => setName(e.target.value)} disabled={isLoading} />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description</label>
          <Input value={description} className="!rounded-xl" onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteOperationModalProps {
  isOpen: boolean;
  operationText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteOperationModal: React.FC<DeleteOperationModalProps> = ({ isOpen, operationText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{operationText}”?</p>
  </Modal>
);
