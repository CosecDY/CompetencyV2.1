import { Logger, LogEvent, FileLogger } from "./FileLogger";

/** Custom error wrapper for DB ops */
export class DatabaseError extends Error {
  constructor(public readonly action: string, public readonly model: string, public readonly originalError: Error) {
    super(`DatabaseError [${action}] on ${model}: ${originalError.message}`);
    this.name = "DatabaseError";
    this.stack = originalError.stack;
  }
}

/** Hooks definition */
type HookContext<T> = { params: any; result?: T };
export interface Hooks<T> {
  beforeCreate?: (ctx: HookContext<T>) => Promise<void>;
  afterCreate?: (ctx: HookContext<T>) => Promise<void>;
}

/** Generic DB manager with logging, hooks & utils */
export class DatabaseManagement<M extends Record<string, any>> {
  private modelName: string;

  constructor(private readonly model: M, private readonly defaultActor: string = "system", private readonly defaultLogger: Logger = new FileLogger(), private readonly hooks: Hooks<any> = {}) {
    this.modelName = (model as any).name ?? model.constructor?.name ?? "UnknownModel";
  }

  private async logEvent(level: LogEvent["level"], action: string, data: any, actor: string, requestId: string | undefined, logger: Logger) {
    await logger.log({
      timestamp: new Date().toISOString(),
      level,
      actor,
      action,
      model: this.modelName,
      data,
      requestId,
    });
  }

  /**
   * Find a unique record by conditions
   * @param args Arguments for model.findUnique(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID for logging
   * @param logger Optional logger instance
   * @param txClient Optional transactional client
   * @returns The found record or null
   */
  public async findUnique<T>(args: Parameters<M["findUnique"]>[0], actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T | null> {
    try {
      const client = txClient ?? this.model;
      return await client.findUnique(args);
    } catch (err: any) {
      await this.logEvent("ERROR", "READ_ONE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("READ_ONE", this.modelName, err);
    }
  }

  /**
   * Find multiple records
   * @param params Arguments for model.findMany(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID for logging
   * @param logger Optional logger instance
   * @param txClient Optional transactional client
   * @returns Array of records
   */
  public async findMany<T>(params: Parameters<M["findMany"]>[0] = {} as any, actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T[]> {
    try {
      const client = txClient ?? this.model;
      if (params && (params as any).$scalars && ((params as any).include || (params as any).select)) {
        delete (params as any).$scalars;
      }
      return await client.findMany(params);
    } catch (err: any) {
      await this.logEvent("ERROR", "READ_MANY", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("READ_MANY", this.modelName, err);
    }
  }

  /**
   * Find the first record that matches conditions
   * @param params Arguments for model.findFirst(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The first matching record or null
   */
  public async findFirst<T>(
    params: Parameters<M["findFirst"]>[0] = {} as any,
    actor: string = this.defaultActor,
    requestId?: string,
    logger: Logger = this.defaultLogger,
    txClient?: M
  ): Promise<T | null> {
    try {
      const client = txClient ?? this.model;
      const result = await (client as any).findFirst(params);
      return result as T | null;
    } catch (err: any) {
      await this.logEvent("ERROR", "READ_FIRST", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("READ_FIRST", this.modelName, err);
    }
  }

  /**
   * Create a new record
   * @param params Arguments for model.create(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The newly created record
   */
  public async create<T>(params: Parameters<M["create"]>[0], actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T> {
    const ctx: HookContext<T> = { params };
    try {
      if (this.hooks.beforeCreate) await this.hooks.beforeCreate(ctx);
      const client = txClient ?? this.model;
      const result = await client.create(params);
      ctx.result = result;
      await this.logEvent("INFO", "CREATE", result, actor, requestId, logger);
      if (this.hooks.afterCreate) await this.hooks.afterCreate(ctx);
      return result;
    } catch (err: any) {
      await this.logEvent("ERROR", "CREATE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("CREATE", this.modelName, err);
    }
  }

  /**
   * Create multiple records
   * @param params Arguments for model.createMany(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger instance
   * @param txClient Optional transactional client
   * @returns The result of createMany (usually { count: number })
   */
  public async createMany(
    params: Parameters<M["createMany"]>[0],
    actor: string = this.defaultActor,
    requestId?: string,
    logger: Logger = this.defaultLogger,
    txClient?: M
  ): Promise<Awaited<ReturnType<M["createMany"]>>> {
    try {
      const client = txClient ?? this.model;

      const result = await (client as any).createMany(params);

      await this.logEvent("INFO", "CREATE", result, actor, requestId, logger);

      return result as Awaited<ReturnType<M["createMany"]>>;
    } catch (err: any) {
      await this.logEvent("ERROR", "CREATE", { error: err.message }, actor, requestId, logger);

      throw new DatabaseError("CREATE", this.modelName, err);
    }
  }

  /**
   * Update a record
   * @param params Arguments for model.update(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The updated record
   */
  public async update<T>(params: Parameters<M["update"]>[0], actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T> {
    try {
      const client = txClient ?? this.model;
      const result = await client.update(params);
      await this.logEvent("INFO", "UPDATE", result, actor, requestId, logger);
      return result;
    } catch (err: any) {
      await this.logEvent("ERROR", "UPDATE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("UPDATE", this.modelName, err);
    }
  }

  /**
   * Bulk update multiple records
   * @param params Arguments for model.updateMany(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The result of updateMany
   */
  public async updateMany(
    params: Parameters<M["updateMany"]>[0],
    actor: string = this.defaultActor,
    requestId?: string,
    logger: Logger = this.defaultLogger,
    txClient?: M
  ): Promise<Awaited<ReturnType<M["updateMany"]>>> {
    try {
      const client = txClient ?? this.model;
      const result = await (client as any).updateMany(params);
      await this.logEvent("INFO", "UPDATE", result, actor, requestId, logger);
      return result as Awaited<ReturnType<M["updateMany"]>>;
    } catch (err: any) {
      await this.logEvent("ERROR", "UPDATE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("UPDATE", this.modelName, err);
    }
  }

  /**
   * Delete a record
   * @param params Arguments for model.delete(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The deleted record
   */
  public async delete<T>(params: Parameters<M["delete"]>[0], actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T> {
    try {
      const client = txClient ?? this.model;
      const result = await client.delete(params);
      await this.logEvent("INFO", "DELETE", result, actor, requestId, logger);
      return result;
    } catch (err: any) {
      await this.logEvent("ERROR", "DELETE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("DELETE", this.modelName, err);
    }
  }

  /**
   * Delete multiple records
   * @param params Arguments for model.deleteMany(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The result of deleteMany
   */
  public async deleteMany(
    params: Parameters<M["deleteMany"]>[0],
    actor: string = this.defaultActor,
    requestId?: string,
    logger: Logger = this.defaultLogger,
    txClient?: M
  ): Promise<Awaited<ReturnType<M["deleteMany"]>>> {
    try {
      const client = txClient ?? this.model;
      const result = await client.deleteMany(params);
      await this.logEvent("INFO", "DELETE", result, actor, requestId, logger);
      return result as Awaited<ReturnType<M["deleteMany"]>>;
    } catch (err: any) {
      await this.logEvent("ERROR", "DELETE", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("DELETE", this.modelName, err);
    }
  }

  /**
   * Upsert a record
   * @param params Arguments for model.upsert(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns The upserted record
   */
  public async upsert<T>(params: Parameters<M["upsert"]>[0], actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<T> {
    try {
      const client = txClient ?? this.model;
      const result = await client.upsert(params);
      await this.logEvent("INFO", "UPSERT", result, actor, requestId, logger);
      return result;
    } catch (err: any) {
      await this.logEvent("ERROR", "UPSERT", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("UPSERT", this.modelName, err);
    }
  }

  /**
   * Run multiple operations inside a transaction
   * @param operations A callback that receives a transactional client
   * @param actor Who performs this operation
   * @returns Array of results from operations
   */
  public async transaction(operations: (client: M) => Promise<any[]>, actor: string = this.defaultActor): Promise<any[]> {
    if (typeof (this.model as any).$transaction !== "function") {
      throw new Error("Transactions not supported by this model");
    }

    try {
      const result = await (this.model as any).$transaction(async (txClient: M) => {
        return await operations(txClient);
      });
      return result;
    } catch (err: any) {
      throw new DatabaseError("TRANSACTION", this.modelName, err);
    }
  }

  /**
   * Count records
   * @param args Arguments for model.count(...)
   * @param actor Who performs this operation
   * @param requestId Optional correlation ID
   * @param logger Optional logger
   * @param txClient Optional transactional client
   * @returns Number of matching records
   */
  public async count(args: Parameters<M["count"]>[0] = {}, actor: string = this.defaultActor, requestId?: string, logger: Logger = this.defaultLogger, txClient?: M): Promise<number> {
    try {
      const client = txClient ?? this.model;
      return await (client as any).count(args);
    } catch (err: any) {
      await this.logEvent("ERROR", "COUNT", { error: err.message }, actor, requestId, logger);
      throw new DatabaseError("COUNT", this.modelName, err);
    }
  }
}
