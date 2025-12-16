import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface AddEditUnitSectorModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialUnitCode: number | null;
  initialSectorId: number | null;
  onClose: () => void;
  onConfirm: (unitCode: number | null, sectorId: number | null) => void;
  isLoading?: boolean;
}

export const AddEditUnitSectorModal: React.FC<AddEditUnitSectorModalProps> = ({ isOpen, mode, initialUnitCode, initialSectorId, onClose, onConfirm, isLoading = false }) => {
  const [unitCode, setUnitCode] = React.useState<number | null>(initialUnitCode);
  const [sectorId, setSectorId] = React.useState<number | null>(initialSectorId);

  React.useEffect(() => {
    setUnitCode(initialUnitCode);
    setSectorId(initialSectorId);
  }, [initialUnitCode, initialSectorId]);

  const handleSubmit = () => {
    if (unitCode === null || sectorId === null) return;
    onConfirm(unitCode, sectorId);
  };

  const title = mode === "add" ? "Add Unit–Sector" : "Edit Unit–Sector";
  const isValid = unitCode !== null && sectorId !== null;

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
            Unit Code (ID) <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={unitCode ?? ""} onChange={(e) => setUnitCode(e.target.value ? Number(e.target.value) : null)} placeholder="Enter Unit Code ID" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Sector ID <span className="text-red-500">*</span>
          </label>
          <Input type="number" value={sectorId ?? ""} onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : null)} placeholder="Enter Sector ID" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteUnitSectorModalProps {
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUnitSectorModal: React.FC<DeleteUnitSectorModalProps> = ({ isOpen, label, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Unit–Sector"
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
      <p>Are you sure you want to delete the unit–sector mapping {label ? `"${label}"` : ""}?</p>
    </Modal>
  );
};
