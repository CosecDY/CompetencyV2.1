import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditUnitOccupationalModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialUnitCode: number | null;
  initialOccupationalId: number | null;
  onClose: () => void;
  onConfirm: (unitCode: number | null, occupationalId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditUnitOccupationalModal: React.FC<AddEditUnitOccupationalModalProps> = ({ isOpen, mode, initialUnitCode, initialOccupationalId, onClose, onConfirm, isLoading = false }) => {
  const [unitCode, setUnitCode] = React.useState<number | null>(initialUnitCode);
  const [occupationalId, setOccupationalId] = React.useState<number | null>(initialOccupationalId);

  React.useEffect(() => {
    setUnitCode(initialUnitCode);
    setOccupationalId(initialOccupationalId);
  }, [initialUnitCode, initialOccupationalId]);

  const title = mode === "add" ? "Add Unit–Occupational" : "Edit Unit–Occupational";

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
          <LoadingButton onClick={() => onConfirm(unitCode, occupationalId)} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
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
            Occupational ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={occupationalId ?? ""} onChange={(e) => setOccupationalId(e.target.value === "" ? null : Number(e.target.value))} placeholder="Enter occupational ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteUnitOccupationalModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUnitOccupationalModal: React.FC<DeleteUnitOccupationalModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Unit–Occupational"
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
