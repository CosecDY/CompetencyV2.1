import { UserRepository } from "@Competency/repositories/RoleRepository";
import type { User, Session } from "@prisma/client_competency";
import { BaseService } from "@Utils/BaseService";
const ONLINE_THRESHOLD = Number(process.env.ONLINE_THRESHOLD_SEC || 900) * 1000;
export class UserService extends BaseService<User, keyof User> {
  constructor() {
    super(new UserRepository(), ["id", "email", "firstNameTH", "lastNameTH"], "id", { sessions: true });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.repo.findFirst({ where: { email } });
  }

  async createUser(data: Partial<User>, actor: string = "system"): Promise<User> {
    const existing = await this.repo.findFirst({ where: { email: data.email } });
    if (existing) {
      throw new Error("User with this email already exists");
    }
    return await this.repo.create(data, actor);
  }

  async updateUser(id: string, updateData: Partial<User>, actor: string = "system"): Promise<User> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }
    return await this.repo.update(id, updateData, actor);
  }

  async deleteUser(id: string, actor: string = "system"): Promise<User> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }
    return await this.repo.delete(id, actor);
  }

  // --- override getAll ---
  async getAll(search?: string, page?: number, perPage?: number): Promise<{ data: (User & { sessions?: Session[]; status: "online" | "offline" })[]; total: number }> {
    const commonQuery: any = {
      ...(this.includes ? { include: this.includes } : {}),
      include: { sessions: true },
      where: {} as any,
    };

    if (search && search.trim()) {
      commonQuery.where.OR = this.searchFields.map((fieldPath) => {
        const parts = fieldPath.split(".");
        let nested: any = { contains: search.trim() };
        for (let i = parts.length - 1; i >= 1; i--) {
          nested = { [parts[i]]: nested };
        }
        return { [parts[0]]: nested };
      });
    }

    let data: (User & { sessions?: Session[] })[] = [];
    let total: number;

    if (page !== undefined && perPage !== undefined && !isNaN(page) && !isNaN(perPage)) {
      data = await this.repo.findMany({
        ...commonQuery,
        skip: (page - 1) * perPage,
        take: perPage,
      });
      total = await this.repo.manager.count({ where: commonQuery.where });
    } else {
      data = await this.repo.findMany(commonQuery);
      total = data.length;
    }

    const now = Date.now();
    const dataWithStatus: (User & { sessions?: Session[]; status: "online" | "offline" })[] = data.map((user) => {
      const online = user.sessions?.some((s) => s.expiresAt.getTime() > now && now - s.lastActivityAt.getTime() < ONLINE_THRESHOLD);
      return { ...user, status: online ? "online" : "offline" };
    });

    return { data: dataWithStatus, total };
  }
}
