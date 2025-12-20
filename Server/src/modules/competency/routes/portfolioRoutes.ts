import { Router } from "express";
import { PortfolioController } from "../controllers/portfolioController";

const router = Router();

// Create
router.post("/create", PortfolioController.create);

// Get User's Portfolios (List)
router.get("/user/:userId", PortfolioController.getByUser);

// Get Specific Portfolio & Delete
router.get("/:id", PortfolioController.getById);
router.delete("/:id", PortfolioController.delete);
router.put("/:id", PortfolioController.update);
export default router;
