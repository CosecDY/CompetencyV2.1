import { AxiosResponse } from "axios";
import api from "@Services/api";
import { User, UserWithRoles } from "modules/admin/rbac/types/userTypes";
import { Role } from "modules/admin/rbac/types/roleTypes";
import { Session } from "modules/admin/rbac/types/sessionTypes";

export interface UserWithStatus extends User {
  sessions?: Session[];
  status: "online" | "offline";
}
export interface UserPageResult {
  data: User[];
  total: number;
}

export const UsersService = {
  getAllUsers: async (search?: string, page?: number, perPage?: number): Promise<UserPageResult> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res: AxiosResponse<UserPageResult> = await api.get("/admin/rbac/users", { params });
    return res.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const res: AxiosResponse<User> = await api.get(`/admin/rbac/users/${id}`);
    return res.data;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const res: AxiosResponse<User> = await api.get("/admin/rbac/users/by-email", { params: { email } });
    return res.data;
  },

  createUser: async (payload: User): Promise<User> => {
    const res: AxiosResponse<User> = await api.post("/admin/rbac/users", payload);
    return res.data;
  },

  updateUser: async (id: string, payload: Partial<User>): Promise<User> => {
    const res: AxiosResponse<User> = await api.put(`/admin/rbac/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/rbac/users/${id}`);
  },

  assignRoleToUser: async (userId: string, roleId: number): Promise<void> => {
    await api.post("/admin/rbac/user-roles", { userId, roleId });
  },

  revokeRoleFromUser: async (userId: string, roleId: number): Promise<void> => {
    await api.delete("/admin/rbac/user-roles", { data: { userId, roleId } });
  },

  getUserRoles: async (userId: string): Promise<Role[]> => {
    const res: AxiosResponse<Role[]> = await api.get(`/admin/rbac/user-roles/user/${userId}`);
    return res.data;
  },
  searchUsersByEmail: async (email: string): Promise<UserWithRoles[]> => {
    if (!email || !email.trim()) return [];
    const res: AxiosResponse<UserWithRoles[]> = await api.get("/admin/rbac/users/search-by-email", {
      params: { email: email.trim() },
    });
    console.log(res.data);

    return res.data;
  },
};
