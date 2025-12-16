import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import React, { useState, useEffect } from "react";
interface AddEditRoleModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialName: string;
  initialDescription: string;
  initialRoleId: number | null;
  onClose: () => void;
  onConfirm: (name: string, description?: string) => void;
  isLoading?: boolean;
}

export const AddEditRoleModal: React.FC<AddEditRoleModalProps> = ({ isOpen, mode, initialName, initialDescription, onClose, onConfirm, isLoading = false }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  // Update name state when initialName prop changes
  useEffect(() => {
    setName(initialName);
  }, [initialName]);
  // Update description state when initialDescription prop changes
  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Role" : "Edit Role"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {/* Pass both name and description to onConfirm */}
          <LoadingButton onClick={() => onConfirm(name, description)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Role Name</label>
          <Input value={name} className="!rounded-xl" onChange={(e) => setName(e.target.value)} disabled={isLoading} />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description</label>
          {/* Input field for description */}
          <Input value={description} className="!rounded-xl" onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteRoleModalProps {
  isOpen: boolean;
  roleText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({ isOpen, roleText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{roleText}”?</p>
  </Modal>
);
