import { Router } from "express";
import authRoutes from "@Competency/routes/authRoutes";
import { CompetencyController } from "@Competency/controllers/competencyController";
import searchCompetencyRoutes from "@Competency/routes/searchCompetencyRoutes";
import profileRoutes from "./profileRoutes";
import portfolioRoutes from "./portfolioRoutes";
import { authenticate, optionalAuthenticate } from "@Middlewares/authMiddleware";
const router = Router();

router.get("/", (req, res) => {
  res.send("Hello from Competency API");
});

router.use("/auth", authRoutes);
router.use("/search", searchCompetencyRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/", profileRoutes);

router.get("/searchCareer", CompetencyController.search);
router.get("/detail", optionalAuthenticate, CompetencyController.getDetail);
router.post("/evidence", authenticate, CompetencyController.saveEvidence);
router.delete("/evidence", authenticate, CompetencyController.deleteEvidence);

export default router;
