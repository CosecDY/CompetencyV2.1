import { Router } from "express";
import authRoutes from "@Competency/routes/authRoutes";

import searchCompetencyRoutes from "@Competency/routes/searchCompetencyRoutes";
import profileRoutes from "./profileRoutes";
import portfolioRoutes from "./portfolioRoutes";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello from Competency API");
});

router.use("/auth", authRoutes);
router.use("/search", searchCompetencyRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/", profileRoutes);

export default router;
