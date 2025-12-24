import { Router } from "express";
// import { postTpqiEvidenceController } from "../controllers/postEvidenceController";
import { getTpqiEvidenceController } from "../controllers/getEvidenceController";
import { authenticate } from "@/middlewares/authMiddleware";
import { delEvidenceController } from "../controllers/delEvidenceController";

const router = Router();

// example route: /api/tpqi/evidence
// permission: public
router.get("/", (req, res) => {
  res.send("Hello from tpqi evidence routes");
});

// example route: /api/tpqi/evidence
// permission: protected
// body: { "skillId": "string", "knowledgeId": "string"
// router.post("/", authenticate, postTpqiEvidenceController);

// example route: /api/tpqi/evidence/get
// permission: protected
// body: { "unitCode": "string" }
router.post("/get", authenticate, getTpqiEvidenceController);

// example route: /api/tpqi/evidence/delete
// permission: protected
// body: { "unitCode": "string" }
router.delete("/delete", authenticate, delEvidenceController);

export default router;
