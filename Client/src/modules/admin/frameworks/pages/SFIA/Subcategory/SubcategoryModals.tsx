import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditSubcategoryModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialText: string;
  initialCategoryId: number | null;
  onClose: () => void;
  onConfirm: (name: string, categoryId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditSubcategoryModal: React.FC<AddEditSubcategoryModalProps> = ({ isOpen, mode, initialText, initialCategoryId, onClose, onConfirm, isLoading = false }) => {
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
      title={mode === "add" ? "Add Subcategory" : "Edit Subcategory"}
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
          <label className="block text-sm mb-1 ml-0.5">Subcategory Name</label>
          <Input value={name} className="!rounded-xl" onChange={(e) => setName(e.target.value)} disabled={isLoading} />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteSubcategoryModalProps {
  isOpen: boolean;
  subcategoryText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteSubcategoryModal: React.FC<DeleteSubcategoryModalProps> = ({ isOpen, subcategoryText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{subcategoryText}”?</p>
  </Modal>
);
