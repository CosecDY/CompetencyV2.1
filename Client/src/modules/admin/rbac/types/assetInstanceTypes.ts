export interface AssetInstance {
  id: number;
  assetId: number;
  recordId: string;
}

export interface CreateAssetInstanceDto {
  assetId: number;
  recordId: string;
}

export interface UpdateAssetInstanceDto {
  newRecordId: string;
}

export interface AssetPageResult {
  data: AssetInstance[];
  total: number;
}
