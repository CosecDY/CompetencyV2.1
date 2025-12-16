import api from "@Services/api";
import { Information, InformationPageResult, UpdateInformationDto } from "modules/admin/frameworks/types/sfia/informationTypes";

const BASE_URL = "/admin/sfia/information";

export const InformationService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<InformationPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<InformationPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Information>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async update(id: number, data: UpdateInformationDto) {
    const res = await api.put<Information>(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
