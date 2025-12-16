import api from "@Services/api";
import { UnitSector, UnitSectorPageResult, CreateUnitSectorDto, UpdateUnitSectorDto } from "modules/admin/frameworks/types/tpqi/unitSectorTypes";

const BASE_URL = "/admin/tpqi/unit-sector";

export const UnitSectorService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UnitSectorPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<UnitSectorPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UnitSector>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateUnitSectorDto) {
    const res = await api.post<UnitSector>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateUnitSectorDto) {
    const res = await api.put<UnitSector>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
