import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditCLUnitCodeModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCareerLevelId: number | null;
  initialUnitCodeId: number | null;
  onClose: () => void;
  onConfirm: (careerLevelId: number | null, unitCodeId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditCLUnitCodeModal: React.FC<AddEditCLUnitCodeModalProps> = ({ isOpen, mode, initialCareerLevelId, initialUnitCodeId, onClose, onConfirm, isLoading = false }) => {
  const [careerLevelId, setCareerLevelId] = React.useState<number | null>(initialCareerLevelId);
  const [unitCodeId, setUnitCodeId] = React.useState<number | null>(initialUnitCodeId);

  React.useEffect(() => {
    setCareerLevelId(initialCareerLevelId);
    setUnitCodeId(initialUnitCodeId);
  }, [initialCareerLevelId, initialUnitCodeId]);

  const title = mode === "add" ? "Add Career Level Unit Code" : "Edit Career Level Unit Code";

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
          <LoadingButton onClick={() => onConfirm(careerLevelId, unitCodeId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
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
          <Input type="number" value={careerLevelId ?? ""} onChange={(e) => setCareerLevelId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter career level ID" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Unit Code ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={unitCodeId ?? ""} onChange={(e) => setUnitCodeId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter unit code ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteCLUnitCodeModalProps {
  isOpen: boolean;
  label?: string; // e.g. "Career X / Level 2 / UC: U-001 Name"
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteCLUnitCodeModal: React.FC<DeleteCLUnitCodeModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Career Level Unit Code"
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
