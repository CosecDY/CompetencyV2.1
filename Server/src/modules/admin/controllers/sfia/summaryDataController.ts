import { Request, Response, NextFunction } from "express";
import { SummaryDataService } from "@Admin/services/sfia/SummaryDataService";
import type { SfiaSummary } from "@prisma/client_sfia";

const summaryService = new SummaryDataService();

export class SummaryDataController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const pageRaw = req.query.page;
      const perPageRaw = req.query.perPage;
      const page = pageRaw && !isNaN(+pageRaw) ? parseInt(pageRaw as string, 10) : undefined;
      const perPage = perPageRaw && !isNaN(+perPageRaw) ? parseInt(perPageRaw as string, 10) : undefined;

      const items = await summaryService.getAll(search, page, perPage);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await summaryService.getById(id);
      if (!item) {
        return res.status(404).json({ error: `SummaryData with id ${id} not found` });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const data = req.body as Omit<SfiaSummary, "id">;
      const newItem = await summaryService.create(data, actor);
      res.status(201).json(newItem);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const id = Number(req.params.id);
      const updates = req.body as Partial<Omit<SfiaSummary, "id">>;
      const updated = await summaryService.update(id, updates, actor);
      res.json(updated);
    } catch (err: any) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: `SummaryData with id ${req.params.id} not found` });
      }
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.headers["x-actor-id"] as string;
      const id = Number(req.params.id);
      await summaryService.delete(id, actor);
      res.status(204).send();
    } catch (err: any) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: `SummaryData with id ${req.params.id} not found` });
      }
      next(err);
    }
  }
}
