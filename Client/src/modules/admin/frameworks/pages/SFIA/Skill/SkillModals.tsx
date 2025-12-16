import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditSkillModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCode: number | null;
  onClose: () => void;
  onConfirm: (initialCode: number | null) => void;
  isLoading?: boolean;
}

export const AddEditSkillModal: React.FC<AddEditSkillModalProps> = ({ isOpen, mode, initialCode, onClose, onConfirm, isLoading = false }) => {
  const [codeId, setCodeId] = React.useState<number | null>(initialCode);

  React.useEffect(() => {
    setCodeId(initialCode);
  }, [initialCode]);

  const title = mode === "add" ? "Add Skill" : "Edit Skill";

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
          <LoadingButton onClick={() => onConfirm(codeId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Code Skill ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={codeId ?? ""} onChange={(e) => setCodeId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter skill code ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteSkillModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteSkillModal: React.FC<DeleteSkillModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Skill"
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
