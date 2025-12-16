import React from "react";
import { Modal, Button, LoadingButton } from "@Components/Admin/Common/ExportComponent";

interface DeleteSessionModalProps {
  isOpen: boolean;
  sessionId?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({ isOpen, sessionId, onClose, onConfirm, isLoading = false }) => (
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
    <p>
      Are you sure you want to delete session “<span className="font-semibold">{sessionId}</span>”?
    </p>
  </Modal>
);
