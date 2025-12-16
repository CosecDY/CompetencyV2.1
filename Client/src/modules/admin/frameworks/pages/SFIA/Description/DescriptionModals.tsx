import React, { useEffect, useState } from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditDescriptionModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialText: string;
  onClose: () => void;
  onConfirm: (text: string) => void;
  isLoading?: boolean;
}

export const AddEditDescriptionModal: React.FC<AddEditDescriptionModalProps> = ({ isOpen, mode, initialText, onClose, onConfirm, isLoading = false }) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Description" : "Edit Description"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(text)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description</label>
          <Input value={text} className="!rounded-xl" onChange={(e) => setText(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteDescriptionModalProps {
  isOpen: boolean;
  descriptionText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteDescriptionModal: React.FC<DeleteDescriptionModalProps> = ({ isOpen, descriptionText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{descriptionText}”?</p>
  </Modal>
);
