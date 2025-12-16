import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditClDetailModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCareerLevelId: number | null;
  initialDescription: string;
  onClose: () => void;
  onConfirm: (payload: { careerLevelId: number; description: string }) => void;
  isLoading?: boolean;
}

export const AddEditClDetailModal: React.FC<AddEditClDetailModalProps> = ({ isOpen, mode, initialCareerLevelId, initialDescription, onClose, onConfirm, isLoading = false }) => {
  const [careerLevelId, setCareerLevelId] = React.useState<number | "">(initialCareerLevelId ?? "");
  const [description, setDescription] = React.useState<string>(initialDescription ?? "");

  React.useEffect(() => {
    setCareerLevelId(initialCareerLevelId ?? "");
    setDescription(initialDescription ?? "");
  }, [initialCareerLevelId, initialDescription]);

  const handleSubmit = () => {
    if (careerLevelId === "" || !description.trim()) return;
    onConfirm({
      careerLevelId: Number(careerLevelId),
      description: description.trim(),
    });
  };

  const title = mode === "add" ? "Add Detail" : "Edit Detail";
  const isValid = careerLevelId !== "" && !!description.trim();

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={handleSubmit} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."} disabled={!isValid}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Career Level ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={careerLevelId} onChange={(e) => setCareerLevelId(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Enter career level ID" required />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full min-h-[120px] rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detail description"
            required
          />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteClDetailModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteClDetailModal: React.FC<DeleteClDetailModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Detail"
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={onConfirm} isLoading={isLoading} loadingText="Deleting...">
            Delete
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <p>Are you sure you want to delete {label ? <b>{label}</b> : "this item"}?</p>
      </div>
    </Modal>
  );
};
