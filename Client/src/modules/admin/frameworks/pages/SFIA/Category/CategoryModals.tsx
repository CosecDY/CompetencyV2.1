import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Select, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditCategoryModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCategoryText: string;
  initialSubcategoryId: number | null;
  subcategoryOptions: { label: string; value: number }[];
  onClose: () => void;
  onConfirm: (categoryText: string, subcategoryId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({ isOpen, mode, initialCategoryText, initialSubcategoryId, subcategoryOptions, onClose, onConfirm, isLoading = false }) => {
  const [categoryText, setCategoryText] = useState(initialCategoryText);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(initialSubcategoryId);

  useEffect(() => {
    setCategoryText(initialCategoryText);
    setSubcategoryId(initialSubcategoryId);
  }, [initialCategoryText, initialSubcategoryId]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Category" : "Edit Category"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={() => onConfirm(categoryText, subcategoryId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Category Text</label>
          <Input value={categoryText} className="!rounded-xl" onChange={(e) => setCategoryText(e.target.value)} disabled={isLoading} />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Subcategory</label>
          <Select
            value={subcategoryId !== null ? subcategoryId : ""}
            options={subcategoryOptions}
            onChange={(val) => setSubcategoryId(val === "" ? null : (val as number))}
            disabled={isLoading}
            className="!rounded-xl"
            placeholder="Select subcategory"
          />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({ isOpen, categoryText, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete “{categoryText}”?</p>
  </Modal>
);
