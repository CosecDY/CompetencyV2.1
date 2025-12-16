import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditSubSkillModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialSkillCode: number | null;
  initialDescriptionId: number | null;
  initialSkillText: string;
  onClose: () => void;
  onConfirm: (skillCode: number, descriptionId: number, skillText: string | null) => void;
  isLoading?: boolean;
}

export const AddEditSubSkillModal: React.FC<AddEditSubSkillModalProps> = ({ isOpen, mode, initialSkillCode, initialDescriptionId, initialSkillText, onClose, onConfirm, isLoading = false }) => {
  const [skillCode, setSkillCode] = React.useState<number | "">(initialSkillCode ?? "");
  const [descriptionId, setDescriptionId] = React.useState<number | "">(initialDescriptionId ?? "");
  const [skillText, setSkillText] = React.useState<string>(initialSkillText ?? "");

  React.useEffect(() => {
    setSkillCode(initialSkillCode ?? "");
    setDescriptionId(initialDescriptionId ?? "");
    setSkillText(initialSkillText ?? "");
  }, [initialSkillCode, initialDescriptionId, initialSkillText]);

  const confirm = () => {
    if (skillCode === "" || descriptionId === "") return; // both required numbers
    onConfirm(Number(skillCode), Number(descriptionId), skillText?.trim() || null);
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add SubSkill" : "Edit SubSkill"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={confirm} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Skill Code (number)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={skillCode}
            className="!rounded-xl"
            placeholder="e.g. 101"
            onChange={(e) => setSkillCode(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description ID (number)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={descriptionId}
            className="!rounded-xl"
            placeholder="e.g. 1"
            onChange={(e) => setDescriptionId(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Skill Text</label>
          <Input value={skillText ?? ""} className="!rounded-xl" placeholder="Optional description..." onChange={(e) => setSkillText(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteSubSkillModalProps {
  isOpen: boolean;
  subSkillLabel?: string; // Fixed: prop name should match usage in parent
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteSubSkillModal: React.FC<DeleteSubSkillModalProps> = ({
  isOpen,
  subSkillLabel, // Fixed: renamed from 'label' to match parent component usage
  onClose,
  onConfirm,
  isLoading = false,
}) => (
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
    <p>Are you sure you want to delete "{subSkillLabel}"?</p>
  </Modal>
);
