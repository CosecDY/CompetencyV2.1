// --- Asset ---
export interface Asset {
  id: number;
  tableName: string;
  description?: string | null;
  updatedAt: string;
}

export interface AssetPageResult {
  data: Asset[];
  total: number;
}

export interface CreateAssetDto {
  tableName: string;
  description?: string;
}

export interface UpdateAssetDto {
  tableName?: string;
  description?: string;
}
