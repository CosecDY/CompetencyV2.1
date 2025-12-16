import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditUnitSkillModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialUnitCode: number | null;
  initialSkillId: number | null;
  onClose: () => void;
  onConfirm: (unitCode: number | null, skillId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditUnitSkillModal: React.FC<AddEditUnitSkillModalProps> = ({ isOpen, mode, initialUnitCode, initialSkillId, onClose, onConfirm, isLoading = false }) => {
  const [unitCode, setUnitCode] = React.useState<number | null>(initialUnitCode);
  const [skillId, setSkillId] = React.useState<number | null>(initialSkillId);

  React.useEffect(() => {
    setUnitCode(initialUnitCode);
    setSkillId(initialSkillId);
  }, [initialUnitCode, initialSkillId]);

  const title = mode === "add" ? "Add Unit–Skill" : "Edit Unit–Skill";

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
          <LoadingButton onClick={() => onConfirm(unitCode, skillId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Unit Code (ID) <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={unitCode ?? ""} onChange={(e) => setUnitCode(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter unit code ID" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Skill ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={skillId ?? ""} onChange={(e) => setSkillId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter skill ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteUnitSkillModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUnitSkillModal: React.FC<DeleteUnitSkillModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Unit–Skill"
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
