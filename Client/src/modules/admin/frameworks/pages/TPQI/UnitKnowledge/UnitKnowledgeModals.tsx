import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditUnitKnowledgeModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialUnitCode: number | null;
  initialKnowledgeId: number | null;
  onClose: () => void;
  onConfirm: (unitCode: number | null, knowledgeId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditUnitKnowledgeModal: React.FC<AddEditUnitKnowledgeModalProps> = ({ isOpen, mode, initialUnitCode, initialKnowledgeId, onClose, onConfirm, isLoading = false }) => {
  const [unitCode, setUnitCode] = React.useState<number | null>(initialUnitCode);
  const [knowledgeId, setKnowledgeId] = React.useState<number | null>(initialKnowledgeId);

  React.useEffect(() => {
    setUnitCode(initialUnitCode);
    setKnowledgeId(initialKnowledgeId);
  }, [initialUnitCode, initialKnowledgeId]);

  const title = mode === "add" ? "Add Unit–Knowledge" : "Edit Unit–Knowledge";

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
          <LoadingButton onClick={() => onConfirm(unitCode, knowledgeId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
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
            Knowledge ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={knowledgeId ?? ""} onChange={(e) => setKnowledgeId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter knowledge ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteUnitKnowledgeModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUnitKnowledgeModal: React.FC<DeleteUnitKnowledgeModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Unit–Knowledge"
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
