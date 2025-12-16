import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, LoadingButton, Checkbox, AutocompleteInput } from "@Components/Admin/Common/ExportComponent";
import { UserRole } from "modules/admin/rbac/types/userRoleTypes";

interface AssignRoleModalProps {
  isOpen: boolean;
  selectedRole?: UserRole | null;
  allRoles: { id: number; name: string }[];
  onClose: () => void;
  onConfirm: (userId: string, roleIds: number[]) => void;
  isLoading?: boolean;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ isOpen, selectedRole, allRoles, onClose, onConfirm, isLoading = false }) => {
  const [userEmail, setUserEmail] = useState(selectedRole?.userEmail || "");
  const [userId, setUserId] = useState<string | null>(selectedRole?.userId || null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(selectedRole ? [selectedRole.roleId] : []);
  const [searchResults, setSearchResults] = useState<{ email: string; id: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserEmail(selectedRole?.userEmail || "");
      setUserId(selectedRole?.userId || null);
      setSelectedRoleIds(selectedRole ? [selectedRole.roleId] : []);
      setSearchResults([]);
    }
  }, [isOpen, selectedRole]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
  };

  const handleSearch = (value: string) => {
    setUserEmail(value);
    setUserId(null); // reset userId until selected from list

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!value) return setSearchResults([]);
      setSearchLoading(true);
      try {
        const res = await (await import("modules/admin/rbac/services/rbac/usersService")).UsersService.searchUsersByEmail(value);
        setSearchResults(res.map((u: any) => ({ email: u.email, id: u.id })));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleConfirm = () => {
    if (!userId || selectedRoleIds.length === 0) return;
    onConfirm(userId, selectedRoleIds);
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Roles"
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={handleConfirm} isLoading={isLoading} loadingText="Assigning...">
            Assign
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">User Email</label>
          <AutocompleteInput
            options={searchResults.map((u) => u.email)}
            value={userEmail}
            onChange={handleSearch}
            onSelect={(email: string) => {
              const selected = searchResults.find((u) => u.email === email);
              if (selected) {
                setUserId(selected.id);
                setUserEmail(selected.email);
              }
            }}
            placeholder="Search user by email"
            disabled={isLoading}
            isLoading={searchLoading}
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Select Roles</label>
          <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto border p-2 rounded">
            {allRoles.map((role) => (
              <label key={role.id} className="flex items-center space-x-2">
                <Checkbox checked={selectedRoleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} disabled={isLoading} />
                <span>{role.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface RevokeRoleModalProps {
  isOpen: boolean;
  selectedRole?: UserRole | null;
  onClose: () => void;
  onConfirm: (userId: string, roleId: number) => void;
  isLoading?: boolean;
}

export const RevokeRoleModal: React.FC<RevokeRoleModalProps> = ({ isOpen, selectedRole, onClose, onConfirm, isLoading = false }) => {
  const handleConfirm = () => {
    if (!selectedRole) return;
    onConfirm(selectedRole.userId, selectedRole.roleId);
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Role"
      actions={
        <>
          <Button className="!bg-black !text-white hover:!bg-gray-800" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton onClick={handleConfirm} isLoading={isLoading} loadingText="Revoking..." className="!bg-red-600 !text-white hover:!bg-red-700">
            Revoke
          </LoadingButton>
        </>
      }
    >
      <p>
        Are you sure you want to revoke the role “{selectedRole?.role?.name || "this role"}” from user {selectedRole?.userId}?
      </p>
    </Modal>
  );
};
