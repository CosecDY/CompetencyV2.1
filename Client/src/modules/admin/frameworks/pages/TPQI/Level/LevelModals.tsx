import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditLevelModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialLevelName: string;
  initialId: number | null;
  onClose: () => void;
  onConfirm: (levelName: string, id: number | null) => void;
  isLoading?: boolean;
}

export const AddEditLevelModal: React.FC<AddEditLevelModalProps> = ({ isOpen, mode, initialLevelName, initialId, onClose, onConfirm, isLoading = false }) => {
  const [levelName, setLevelName] = React.useState(initialLevelName);
  const [id, setId] = React.useState<number | null>(initialId);

  React.useEffect(() => {
    setLevelName(initialLevelName);
    setId(initialId);
  }, [initialLevelName, initialId]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Level" : "Edit Level"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(levelName, id)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Level ID</label>
          <Input type="number" value={id ?? ""} onChange={(e) => setId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter level ID" />
          <div className="flex flex-col">
            <label className="block text-sm mb-1 ml-0.5">Level Name</label>
            <Input value={levelName} onChange={(e) => setLevelName(e.target.value)} placeholder="Enter level name" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface DeleteLevelModalProps {
  isOpen: boolean;
  levelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteLevelModal: React.FC<DeleteLevelModalProps> = ({ isOpen, levelText, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Level"
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
        <p>Are you sure you want to delete the level "{levelText}"?</p>
      </div>
    </Modal>
  );
};
