import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditClKnowledgeModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCareerLevelId: number | null;
  initialKnowledgeId: number | null;
  onClose: () => void;
  onConfirm: (payload: { careerLevelId: number; knowledgeId: number }) => void;
  isLoading?: boolean;
}

export const AddEditClKnowledgeModal: React.FC<AddEditClKnowledgeModalProps> = ({ isOpen, mode, initialCareerLevelId, initialKnowledgeId, onClose, onConfirm, isLoading = false }) => {
  const [careerLevelId, setCareerLevelId] = React.useState<number | "">(initialCareerLevelId ?? "");
  const [knowledgeId, setKnowledgeId] = React.useState<number | "">(initialKnowledgeId ?? "");

  React.useEffect(() => {
    setCareerLevelId(initialCareerLevelId ?? "");
    setKnowledgeId(initialKnowledgeId ?? "");
  }, [initialCareerLevelId, initialKnowledgeId]);

  const handleSubmit = () => {
    if (careerLevelId === "" || knowledgeId === "") return;
    onConfirm({
      careerLevelId: Number(careerLevelId),
      knowledgeId: Number(knowledgeId),
    });
  };

  const title = mode === "add" ? "Add Career–Knowledge" : "Edit Career–Knowledge";
  const isValid = careerLevelId !== "" && knowledgeId !== "";

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
            Knowledge ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={knowledgeId} onChange={(e) => setKnowledgeId(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Enter knowledge ID" required />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteClKnowledgeModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteClKnowledgeModal: React.FC<DeleteClKnowledgeModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Career–Knowledge"
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
