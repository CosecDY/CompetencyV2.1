import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import { CreateUnitCodeDto, UpdateUnitCodeDto } from "modules/admin/frameworks/types/tpqi/unitCodeTypes";

interface AddEditUnitCodeModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialCode: string;
  initialName?: string | null;
  initialDescription?: string | null;
  onClose: () => void;
  // onConfirm receives a DTO-like payload; for "add" it matches CreateUnitCodeDto,
  // for "edit" it can be a Partial (UpdateUnitCodeDto)
  onConfirm: (payload: CreateUnitCodeDto | UpdateUnitCodeDto) => void;
  isLoading?: boolean;
}

export const AddEditUnitCodeModal: React.FC<AddEditUnitCodeModalProps> = ({ isOpen, mode, initialCode, initialName = "", initialDescription = "", onClose, onConfirm, isLoading = false }) => {
  const [code, setCode] = React.useState<string>(initialCode);
  const [name, setName] = React.useState<string>(initialName ?? "");
  const [description, setDescription] = React.useState<string>(initialDescription ?? "");

  React.useEffect(() => {
    setCode(initialCode);
    setName(initialName ?? "");
    setDescription(initialDescription ?? "");
  }, [initialCode, initialName, initialDescription]);

  const handleSubmit = () => {
    // Build payload according to your types
    const payload: CreateUnitCodeDto | UpdateUnitCodeDto = {
      code,
      name: name === "" ? null : name,
      description: description === "" ? null : description,
    };
    onConfirm(payload);
  };

  const title = mode === "add" ? "Add Unit Code" : "Edit Unit Code";

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
          <LoadingButton onClick={handleSubmit} isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">
            Code <span className="text-red-500">*</span>
          </label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code (e.g., UC-001)" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Name</label>
          <Input value={name ?? ""} onChange={(e) => setName(e.target.value)} placeholder="Enter name (optional)" />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm mb-1 ml-0.5">Description</label>
          <Input value={description ?? ""} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description (optional)" />
        </div>
      </div>
    </Modal>
  );
};

interface DeleteUnitCodeModalProps {
  isOpen: boolean;
  unitCodeText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUnitCodeModal: React.FC<DeleteUnitCodeModalProps> = ({ isOpen, unitCodeText, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Unit Code"
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
        <p>Are you sure you want to delete "{unitCodeText}"?</p>
      </div>
    </Modal>
  );
};
