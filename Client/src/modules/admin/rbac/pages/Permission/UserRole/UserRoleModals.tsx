import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, LoadingButton, Checkbox, AutocompleteInput } from "@Components/Admin/Common/ExportComponent";
import { UserRole } from "modules/admin/rbac/types/userRoleTypes";
import { FiSearch, FiUser, FiAlertCircle, FiLock } from "react-icons/fi";

export interface TargetUser {
  id: string;
  email: string;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  initialUser?: TargetUser | null;
  allRoles: { id: number; name: string; description?: string }[];
  onClose: () => void;
  onConfirm: (userId: string, roleIds: number[]) => void;
  isLoading?: boolean;
}

// Interface สำหรับผลลัพธ์การค้นหา
interface SearchUserResult {
  email: string;
  id: string;
  roles: { id: number; name?: string }[];
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ isOpen, initialUser, allRoles, onClose, onConfirm, isLoading = false }) => {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const mapUserResponse = (u: any): SearchUserResult => ({
    email: u.email,
    id: u.id,
    roles: u.roles ? u.roles.map((r: any) => ({ id: r.id || r.roleId, name: r.name })) : u.userRoles ? u.userRoles.map((ur: any) => ({ id: ur.roleId || ur.role?.id, name: ur.role?.name })) : [],
  });

  const fetchInitialUserRoles = async (email: string) => {
    setSearchLoading(true);
    try {
      const { UsersService } = await import("modules/admin/rbac/services/rbac/usersService");
      const res = await UsersService.searchUsersByEmail(email);
      const exactMatch = res.find((u: any) => u.email === email);

      if (exactMatch) {
        const mappedUser = mapUserResponse(exactMatch);
        setUserId(mappedUser.id);
        setUserEmail(mappedUser.email);

        setSelectedRoleIds(mappedUser.roles.map((r) => r.id));
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialUser) {
        // --- Edit Mode ---
        setUserEmail(initialUser.email);
        setUserId(initialUser.id);
        fetchInitialUserRoles(initialUser.email);
      } else {
        // --- Assign Mode ---
        setUserEmail("");
        setUserId(null);
        setSelectedRoleIds([]);
        setSearchResults([]);
      }
    }
  }, [isOpen, initialUser]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
  };

  const handleSearch = (value: string) => {
    setUserEmail(value);

    // ถ้า Edit อยู่ ห้ามค้นหาใหม่
    if (initialUser) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!value) return setSearchResults([]);

      setSearchLoading(true);
      try {
        const { UsersService } = await import("modules/admin/rbac/services/rbac/usersService");
        const res = await UsersService.searchUsersByEmail(value);
        setSearchResults(res.map(mapUserResponse));
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleConfirm = () => {
    if (!userId) return;
    onConfirm(userId, selectedRoleIds);
  };

  // เช็คว่าเป็นโหมดแก้ไขหรือไม่
  const isEditMode = !!initialUser;

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit User Roles" : "Assign Roles to User"}
      actions={
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="secondary"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Saving..."
            disabled={!userId} // Role ว่างได้ (กรณีต้องการลบสิทธิ์ทั้งหมด) แต่ User ห้ามว่าง
          >
            {isEditMode ? "Save Changes" : "Confirm Assignment"}
          </LoadingButton>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* User Search / Display Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiUser className="text-gray-400" />
            {isEditMode ? "Target User" : "Find User"}
          </label>
          <div className="relative">
            {isEditMode ? (
              // ✅ UI สำหรับ Edit Mode: แสดงเป็น Box นิ่งๆ แก้ไขไม่ได้
              <div className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm flex items-center select-none cursor-not-allowed">
                <FiLock className="absolute left-3 text-gray-400" />
                <span className="font-medium text-gray-600">{userEmail}</span>
              </div>
            ) : (
              // ✅ UI สำหรับ Assign Mode: ช่อง Search ปกติ
              <>
                <AutocompleteInput
                  options={searchResults.map((u) => u.email)}
                  value={userEmail}
                  onChange={handleSearch}
                  onSelect={(email: string) => {
                    const selected = searchResults.find((u) => u.email === email);
                    if (selected) {
                      setUserId(selected.id);
                      setUserEmail(selected.email);
                      setSelectedRoleIds(selected.roles.map((r) => r.id));
                    }
                  }}
                  placeholder="Type email to search..."
                  disabled={isLoading}
                  isLoading={searchLoading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </>
            )}
          </div>
          {!isEditMode && userId && <p className="text-xs text-green-600 font-medium ml-1">✓ User selected</p>}
        </div>

        {/* Roles Selection Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">Select Roles</label>
            {searchLoading && <span className="text-xs text-primary animate-pulse">Loading current roles...</span>}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">Available Roles ({allRoles.length})</div>
            <div className="max-h-60 overflow-y-auto p-2 bg-white custom-scrollbar">
              {allRoles.length > 0 ? (
                <div className="space-y-1">
                  {allRoles.map((role) => (
                    <label
                      key={role.id}
                      className={`
                          flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors
                          ${selectedRoleIds.includes(role.id) ? "bg-primary/5 border border-primary/10" : "hover:bg-gray-50"}
                        `}
                    >
                      <Checkbox checked={selectedRoleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} disabled={isLoading || searchLoading} />
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${selectedRoleIds.includes(role.id) ? "text-primary-dark" : "text-gray-700"}`}>{role.name}</span>
                        {role.description && <span className="text-xs text-gray-400">{role.description}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No roles available</div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            Selected: <span className="font-medium text-gray-700">{selectedRoleIds.length}</span> roles
          </p>
        </div>
      </div>
    </Modal>
  );
};

// --- Revoke Modal (คงเดิม หรือปรับ style เล็กน้อย) ---
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
      title="Confirm Revoke Role"
      actions={
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Revoking..."
            className="!bg-red-600 hover:!bg-red-700 text-white border-none shadow-sm shadow-red-200"
          >
            Revoke Access
          </LoadingButton>
        </div>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className="p-3 bg-red-50 rounded-full flex-shrink-0">
          <FiAlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-gray-900">Are you absolutely sure?</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            This action will remove the role <span className="font-bold text-gray-800">"{selectedRole?.role?.name}"</span> from user{" "}
            <span className="font-bold text-gray-800">{selectedRole?.userEmail ?? "Unknown User"}</span>.
          </p>
          <p className="text-xs text-red-500 mt-2">They will lose all permissions associated with this role immediately.</p>
        </div>
      </div>
    </Modal>
  );
};
