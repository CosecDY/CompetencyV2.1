import { Request, Response, NextFunction } from "express";
import { DatacollectionService } from "@Admin/services/sfia/DatacollectionService";
import type { Datacollection } from "@prisma/client_sfia";

const service = new DatacollectionService();

export class DatacollectionController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const pageRaw = req.query.page;
      const perPageRaw = req.query.perPage;
      const page = pageRaw && !isNaN(+pageRaw) ? parseInt(pageRaw as string, 10) : undefined;
      const perPage = perPageRaw && !isNaN(+perPageRaw) ? parseInt(perPageRaw as string, 10) : undefined;

      const items = await service.getAll(search, page, perPage);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await service.getById(id);
      if (!item) {
        return res.status(404).json({ error: `Datacollection with id ${id} not found` });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const data = req.body as Omit<Datacollection, "id">;
      const newItem = await service.create(data, actor);
      res.status(201).json(newItem);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const id = Number(req.params.id);
      const updates = req.body as Partial<Omit<Datacollection, "id">>;
      const updated = await service.update(id, updates, actor);
      res.json(updated);
    } catch (err: any) {
      // Handle not found
      if (err.code === "P2025") {
        return res.status(404).json({ error: `Datacollection with id ${req.params.id} not found` });
      }
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const id = Number(req.params.id);
      await service.delete(id, actor);
      res.status(204).send();
    } catch (err: any) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: `Datacollection with id ${req.params.id} not found` });
      }
      next(err);
    }
  }
}
