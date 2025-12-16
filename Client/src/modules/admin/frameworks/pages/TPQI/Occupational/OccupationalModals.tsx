import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditOccupationalModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialText: string;
  initialCategoryId: number | null;
  onClose: () => void;
  onConfirm: (name: string, categoryId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditOccupationalModal: React.FC<AddEditOccupationalModalProps> = ({ isOpen, mode, initialText, initialCategoryId, onClose, onConfirm, isLoading = false }) => {
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
      title={mode === "add" ? "Add Occupational" : "Edit Occupational"}
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
          <label className="block text-sm mb-1 ml-0.5">Occupational Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter occupational name" />
        </div>

        {/* Optional: expose/edit category id (or swap to a Select if you have a list) */}
        {/* <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Category ID (optional)</label>
          <Input
            type="number"
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value === "" ? null : Number(e.target.value))}
            placeholder="Enter category id"
          />
        </div> */}
      </div>
    </Modal>
  );
};

interface DeleteOccupationalModalProps {
  isOpen: boolean;
  occupationalText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteOccupationalModal: React.FC<DeleteOccupationalModalProps> = ({ isOpen, occupationalText, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Occupational"
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
        <p>Are you sure you want to delete the occupational "{occupationalText}"?</p>
      </div>
    </Modal>
  );
};
