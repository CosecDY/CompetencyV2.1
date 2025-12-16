import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditCareerLevelModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCareerId: number | null;
  initialLevelId: number | null;
  onClose: () => void;
  onConfirm: (careerId: number | null, levelId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditCareerLevelModal: React.FC<AddEditCareerLevelModalProps> = ({ isOpen, mode, initialCareerId, initialLevelId, onClose, onConfirm, isLoading = false }) => {
  const [careerId, setCareerId] = React.useState<number | null>(initialCareerId);
  const [levelId, setLevelId] = React.useState<number | null>(initialLevelId);

  React.useEffect(() => {
    setCareerId(initialCareerId);
    setLevelId(initialLevelId);
  }, [initialCareerId, initialLevelId]);

  const title = mode === "add" ? "Add Career Level" : "Edit Career Level";

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
          <LoadingButton onClick={() => onConfirm(careerId, levelId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Career ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={careerId ?? ""} onChange={(e) => setCareerId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter career ID" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Level ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={levelId ?? ""} onChange={(e) => setLevelId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter level ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteCareerLevelModalProps {
  isOpen: boolean;
  label?: string; // e.g. "Printing / Level 2"
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteCareerLevelModal: React.FC<DeleteCareerLevelModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Career Level"
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
        <p>Are you sure you want to delete {label ? `"${label}"` : "this item"}?</p>
      </div>
    </Modal>
  );
};
