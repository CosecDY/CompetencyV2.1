import { InformationRepo } from "@Admin/repositories/sfia/SFIARepositories";
import type { Information } from "@prisma/client_sfia";
import { BaseService } from "@Utils/BaseService";

type GetAllOptions = {
  userId?: string; // ตาม Schema เป็น String (Char 36)
};

export class InformationService extends BaseService<Information, keyof Information> {
  constructor() {
    super(new InformationRepo(), ["text", "approvalStatus"], "id");
  }

  async getAll(search?: string, page?: number, perPage?: number, options?: GetAllOptions): Promise<{ data: Information[]; total: number }> {
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [{ text: { contains: q } }, { approvalStatus: { equals: q } }];
    }

    if (options?.userId) {
      where.userId = options.userId;
    }

    // 3. เตรียม Query พื้นฐาน
    const commonQuery: any = {
      where,
      include: {
        subSkill: {
          include: {
            skill: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    const isPaginated = page !== undefined && perPage !== undefined;

    if (isPaginated) {
      const skip = (Number(page) - 1) * Number(perPage);
      const take = Number(perPage);

      const [data, total] = await Promise.all([
        this.repo.findMany({
          ...commonQuery,
          skip,
          take,
        }),
        this.repo.manager.count({ where }),
      ]);

      return { data: data as any, total };
    }

    const [data, total] = await Promise.all([this.repo.findMany(commonQuery), this.repo.manager.count({ where })]);

    return { data: data as any, total };
  }
}
