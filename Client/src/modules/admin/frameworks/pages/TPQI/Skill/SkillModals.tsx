import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditSkillModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialText: string;
  initialCategoryId: number | null;
  onClose: () => void;
  onConfirm: (name: string, categoryId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditSkillModal: React.FC<AddEditSkillModalProps> = ({ isOpen, mode, initialText, initialCategoryId, onClose, onConfirm, isLoading = false }) => {
  const [name, setName] = React.useState(initialText);
  const [categoryId, setCategoryId] = React.useState<number | null>(initialCategoryId);

  React.useEffect(() => {
    setName(initialText);
    setCategoryId(initialCategoryId);
  }, [initialText, initialCategoryId]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Skill" : "Edit Skill"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(name, categoryId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Skill Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter skill name" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteSkillModalProps {
  isOpen: boolean;
  skillText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteSkillModal: React.FC<DeleteSkillModalProps> = ({ isOpen, skillText, onClose, onConfirm, isLoading = false }) => {
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
        <p>Are you sure you want to delete the skill "{skillText}"?</p>
      </div>
    </Modal>
  );
};
