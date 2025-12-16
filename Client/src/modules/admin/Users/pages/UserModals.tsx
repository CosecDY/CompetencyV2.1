import React from "react";
import { Modal, Button, Input, LoadingButton } from "@Components/Admin/Common/ExportComponent";
import { User } from "modules/admin/rbac/types/userTypes";

interface AddEditUserModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: Partial<User>;
  onClose: () => void;
  onConfirm: (user: Partial<User>) => void;
  isLoading?: boolean;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({ isOpen, mode, initialData = {}, onClose, onConfirm, isLoading = false }) => {
  const [formData, setFormData] = React.useState<Partial<User>>({
    firstNameTH: initialData.firstNameTH || "",
    lastNameTH: initialData.lastNameTH || "",
    firstNameEN: initialData.firstNameEN || "",
    lastNameEN: initialData.lastNameEN || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    line: initialData.line || "",
    address: initialData.address || "",
    profileImage: initialData.profileImage || "",
  });

  React.useEffect(() => {
    setFormData({
      firstNameTH: initialData.firstNameTH || "",
      lastNameTH: initialData.lastNameTH || "",
      firstNameEN: initialData.firstNameEN || "",
      lastNameEN: initialData.lastNameEN || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      line: initialData.line || "",
      address: initialData.address || "",
      profileImage: initialData.profileImage || "",
    });
  }, [initialData]);

  const handleChange = (key: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add User" : "Edit User"}
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton type="submit" form="userForm" isLoading={isLoading} loadingText={mode === "add" ? "Creating..." : "Saving..."}>
            {mode === "add" ? "Create" : "Save"}
          </LoadingButton>
        </>
      }
    >
      <form id="userForm" onSubmit={handleSubmit} className="space-y-3">
        {[
          { label: "First Name (TH)", key: "firstNameTH" },
          { label: "Last Name (TH)", key: "lastNameTH" },
          { label: "First Name (EN)", key: "firstNameEN" },
          { label: "Last Name (EN)", key: "lastNameEN" },
          { label: "Email", key: "email", type: "email" },
          { label: "Phone", key: "phone" },
          { label: "Line", key: "line" },
          { label: "Address", key: "address" },
          { label: "Profile Image URL", key: "profileImage" },
        ].map(({ label, key, type }) => (
          <div className="flex flex-col" key={key}>
            <label className="block text-sm mb-1 ml-0.5">{label}</label>
            <Input value={formData[key as keyof User] || ""} type={type || "text"} className="!rounded-xl" onChange={handleChange(key as keyof User)} disabled={isLoading} />
          </div>
        ))}
      </form>
    </Modal>
  );
};

interface DeleteUserModalProps {
  isOpen: boolean;
  userName?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, userName, onClose, onConfirm, isLoading = false }) => (
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
    <p>Are you sure you want to delete user “{userName}”?</p>
  </Modal>
);
