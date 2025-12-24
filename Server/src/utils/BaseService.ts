export class BaseService<T extends Record<string, any>, K extends keyof T> {
  constructor(protected readonly repo: any, protected readonly searchFields: string[], private readonly pkField: keyof T, protected readonly includes?: Record<string, boolean>) {}

  /**
   * Get all records with optional search and pagination.
   * @param search   Search string
   * @param page     Page number (1-based)
   * @param perPage  Items per page
   * @param txClient Optional transactional client
   */
  async getAll(search?: string, page?: number, perPage?: number, txClient?: any): Promise<{ data: T[]; total: number }> {
    const where: any = {};

    if (search && search.trim()) {
      const trimmed = search.trim();
      where.OR = this.searchFields.map((fieldPath) => {
        const parts = fieldPath.split(".");
        if (parts.length === 1) {
          const key = parts[0] as keyof T;
          return { [key]: typeof trimmed === "string" ? { contains: trimmed } : trimmed };
        } else {
          let nested: any = { contains: trimmed };
          for (let i = parts.length - 1; i >= 1; i--) {
            nested = { [parts[i]]: nested };
          }
          return { [parts[0]]: nested };
        }
      });
    }

    const commonQuery: any = {
      where,
      ...(this.includes ? { include: this.includes } : {}),
    };

    if (page !== undefined && perPage !== undefined && !isNaN(page) && !isNaN(perPage)) {
      const data = await this.repo.findMany({ ...commonQuery, skip: (page - 1) * perPage, take: perPage }, txClient);

      const total = await this.repo.manager.count({ where }, txClient);

      return { data, total };
    }

    const data = await this.repo.findMany(commonQuery, txClient);
    const total = data.length;

    return { data, total };
  }
  /**
   * Get record by primary key.
   */
  getById(id: T[typeof this.pkField], txClient?: any): Promise<T | null> {
    return this.repo.findById(id, txClient);
  }

  /**
   * Create a new record.
   */
  create(data: Omit<T, typeof this.pkField>, actor: string, txClient?: any): Promise<T> {
    return this.repo.create(data, actor, undefined, txClient);
  }

  /**
   * Update a record by primary key.
   */
  update(id: T[typeof this.pkField], updates: Partial<Omit<T, typeof this.pkField>>, actor: string, txClient?: any): Promise<T> {
    return this.repo.update(id, updates, actor, undefined, txClient);
  }

  /**
   * Delete a record by primary key.
   */
  delete(id: T[typeof this.pkField], actor: string, txClient?: any): Promise<T> {
    return this.repo.delete(id, actor, undefined, txClient);
  }
}
