import api from "@Services/api";
import { Sector, SectorPageResult, UpdateSectorDto, CreateSectorDto } from "modules/admin/frameworks/types/tpqi/sectorTypes";

const BASE_URL = "/admin/tpqi/sector";

export const SectorService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SectorPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<SectorPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Sector>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateSectorDto) {
    const res = await api.post<Sector>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateSectorDto) {
    const res = await api.put<Sector>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
