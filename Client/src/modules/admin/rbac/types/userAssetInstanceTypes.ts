export interface UserAssetInstance {
  id: number;
  userId: string;
  assetInstanceId: number;
  assignedAt: string;
  assetInstance?: {
    id: number;
    assetId: number;
    recordId: string;
    assetName?: string;
  };
}

export interface UserAssetInstanceAssignmentDto {
  userId: string;
  assetInstanceIds: number[];
}

export interface UserAssetInstanceListResponse {
  data: UserAssetInstance[];
  total: number;
}

export interface UserAssetInstanceAssignmentDto {
  userId: string;
  assetInstanceIds: number[];
}

export interface UserAssetInstanceListResponse {
  data: UserAssetInstance[];
  total: number;
}
