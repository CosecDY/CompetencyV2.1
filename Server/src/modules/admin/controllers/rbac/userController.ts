import { Request, Response, NextFunction } from "express";
import { UserService } from "@/modules/admin/services/rbac/userService";
import type { User } from "@prisma/client_competency";

const service = new UserService();

interface AuthenticatedRequest extends Request {
  user?: { userId?: string };
}

function UserView(user: User & { status?: "online" | "offline" }) {
  return {
    id: user.id,
    email: user.email,
    profileImage: user.profileImage,
    firstNameTH: user.firstNameTH,
    lastNameTH: user.lastNameTH,
    firstNameEN: user.firstNameEN,
    lastNameEN: user.lastNameEN,
    phone: user.phone,
    line: user.line,
    address: user.address,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    status: user.status ?? "offline",
  };
}

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const pageRaw = req.query.page;
      const perPageRaw = req.query.perPage;
      const page = pageRaw && !isNaN(+pageRaw) ? parseInt(pageRaw as string, 10) : undefined;
      const perPage = perPageRaw && !isNaN(+perPageRaw) ? parseInt(perPageRaw as string, 10) : undefined;
      const { data, total } = await service.getAll(search, page, perPage);

      res.json({
        total,
        data: data.map(UserView),
      });
    } catch (err) {
      next(err);
    }
  }
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await service.getById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(UserView(user));
    } catch (error) {
      next(error);
    }
  }

  static async getUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.query.email;
      if (typeof email !== "string") {
        res.status(400).json({ error: "email query parameter is required" });
        return;
      }
      const user = await service.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(UserView(user));
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actor = req.user?.userId || "system";
      const data = req.body;
      if (!data.email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      const newUser = await service.createUser(data, actor);
      res.status(201).json(UserView(newUser));
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actor = req.user?.userId || "system";
      const id = req.params.id;
      const updateData = req.body;

      const updatedUser = await service.updateUser(id, updateData, actor);
      res.json(UserView(updatedUser));
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actor = req.user?.userId || "system";
      const id = req.params.id;
      await service.deleteUser(id, actor);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async searchUsersByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const emailQuery = req.query.email;
      if (typeof emailQuery !== "string" || !emailQuery.trim()) {
        res.status(400).json({ error: "email query parameter is required" });
        return;
      }

      const users = await service.searchUsersByEmail(emailQuery.trim(), 10);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}
