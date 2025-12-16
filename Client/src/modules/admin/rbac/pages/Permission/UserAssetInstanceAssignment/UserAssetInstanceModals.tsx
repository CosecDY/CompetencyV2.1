import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, LoadingButton, Checkbox, Input } from "@Components/Admin/Common/ExportComponent";
import { UserAssetInstance } from "modules/admin/rbac/types/userAssetInstanceTypes";
import { AssetInstance } from "modules/admin/rbac/types/assetInstanceTypes";
import { User } from "modules/admin/rbac/types/userTypes";
import { useQuery } from "@tanstack/react-query";
import { UsersService } from "modules/admin/rbac/services/rbac/usersService";

interface AssignAssetModalProps {
  isOpen: boolean;
  selectedAsset?: UserAssetInstance | null;
  availableAssets: AssetInstance[];
  onClose: () => void;
  onConfirm: (userId: string, assetInstanceIds: number[]) => void;
  isLoading?: boolean;
}

export const AssignAssetModal: React.FC<AssignAssetModalProps> = ({ isOpen, selectedAsset, availableAssets, onClose, onConfirm, isLoading = false }) => {
  const [userId, setUserId] = useState(selectedAsset?.userId || "");
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>(selectedAsset ? [selectedAsset.assetInstanceId] : []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery<User[], Error>({
    queryKey: ["searchUsers", debouncedSearchTerm],
    queryFn: () => UsersService.searchUsersByEmail(debouncedSearchTerm),
    enabled: debouncedSearchTerm.trim().length > 0,
  });

  useEffect(() => {
    if (isOpen) {
      setUserId(selectedAsset?.userId || "");
      setSelectedAssetIds(selectedAsset ? [selectedAsset.assetInstanceId] : []);
      setSearchTerm("");
      setShowSearchResults(false);
    }
  }, [isOpen, selectedAsset]);

  const toggleAsset = (assetId: number) => {
    setSelectedAssetIds((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]));
  };

  const handleConfirm = () => {
    if (!userId || selectedAssetIds.length === 0) return;
    onConfirm(userId, selectedAssetIds);
  };

  const handleSelectUser = useCallback((user: User) => {
    setUserId(user.id);
    setSearchTerm("");
    setShowSearchResults(false);
  }, []);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Asset Instances"
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
        {/* Search User */}
        <div className="flex flex-col relative">
          <label>User ID / Email</label>
          <Input
            type="text"
            className="border rounded p-2"
            value={userId || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            placeholder="Search by User ID or Email"
            disabled={isLoading}
          />
          {showSearchResults && debouncedSearchTerm && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
              {usersLoading && <div className="p-2 text-gray-500">Searching...</div>}
              {usersError && <div className="p-2 text-red-500">Error searching users.</div>}
              {!usersLoading && users.length === 0 && <div className="p-2 text-gray-500">No users found.</div>}
              {users.map((user) => (
                <div key={user.id} className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectUser(user)}>
                  <div>{user.email}</div>
                  <div className="text-sm text-gray-500">{user.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Select Assets */}
        <div className="flex flex-col">
          <label>Select Asset Instances</label>
          <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto border p-2 rounded">
            {availableAssets.length > 0 ? (
              availableAssets.map((asset) => (
                <label key={asset.id} className="flex items-center space-x-2">
                  <Checkbox checked={selectedAssetIds.includes(asset.id)} onCheckedChange={() => toggleAsset(asset.id)} disabled={isLoading} />
                  <span>{asset.recordId || "Unknown Asset"}</span>
                </label>
              ))
            ) : (
              <p className="text-gray-500">No assets available.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Custom Hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface RevokeAssetModalProps {
  isOpen: boolean;
  selectedAsset?: UserAssetInstance | null;
  onClose: () => void;
  onConfirm: (userId: string, assetInstanceId: number) => void;
  isLoading?: boolean;
}

export const RevokeAssetModal: React.FC<RevokeAssetModalProps> = ({ isOpen, selectedAsset, onClose, onConfirm, isLoading = false }) => {
  const handleConfirm = () => {
    if (!selectedAsset) return;
    onConfirm(selectedAsset.userId, selectedAsset.assetInstanceId);
  };

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Asset Instance"
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
        Are you sure you want to revoke the asset instance “{selectedAsset?.assetInstance?.recordId || "this asset"}” from user {selectedAsset?.userId}?
      </p>
    </Modal>
  );
};
