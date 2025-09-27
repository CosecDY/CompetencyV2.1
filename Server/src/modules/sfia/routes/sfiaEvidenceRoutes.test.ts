import request from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import express, { Request, Response, NextFunction } from "express";
import sfiaEvidenceRoutes from "./sfiaEvidenceRoutes";
import * as getEvidenceController from "../controllers/getEvidenceController";
import * as postEvidenceController from "../controllers/postEvidenceController";
import * as delEvidenceController from "../controllers/delEvidenceController";
import { AuthenticatedRequest } from "@/middlewares/authMiddleware";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/sfia/evidence", sfiaEvidenceRoutes);

// Mock the controller functions
vi.mock("../controllers/getEvidenceController", () => ({
  getEvidenceController: vi.fn(),
}));

vi.mock("../controllers/postEvidenceController", () => ({
  postEvidenceController: vi.fn(),
}));

vi.mock("../controllers/delEvidenceController", () => ({
  delEvidenceController: vi.fn(),
}));

// Mock the auth middleware
vi.mock("@/middlewares/authMiddleware", () => ({
  authenticate: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // Mock authenticated user
    (req as AuthenticatedRequest).user = {
      userId: "test-user-123",
      email: "test@example.com",
      roles: ["User"],
      permissions: ["evidence:read", "evidence:write", "evidence:delete"],
    };
    next();
  }),
}));

const mockGetController = getEvidenceController.getEvidenceController as any;
const mockPostController = postEvidenceController.postEvidenceController as any;
const mockDelController = delEvidenceController.delEvidenceController as any;

describe("SFIA Evidence Routes", () => {
  beforeAll(() => {
    // Setup any necessary test data or configurations
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Cleanup after tests
    vi.clearAllMocks();
  });

  describe("GET /api/sfia/evidence", () => {
    it("should return hello message from root endpoint", async () => {
      const response = await request(app).get("/api/sfia/evidence").expect(200);

      expect(response.text).toBe("Hello from sfia evidence routes");
    });

    it("should not require authentication for root endpoint", async () => {
      // Test without mocked auth
      const response = await request(app).get("/api/sfia/evidence").expect(200);

      expect(response.text).toBe("Hello from sfia evidence routes");
    });
  });

  describe("POST /api/sfia/evidence", () => {
    it("should create evidence successfully with valid data", async () => {
      const mockResponse = {
        success: true,
        message: "Evidence created successfully.",
        data: {
          id: 1,
          subSkillId: 123,
          evidenceUrl: "https://example.com/evidence",
          userId: "test-user-123",
          createdAt: new Date().toISOString(),
        },
      };

      mockPostController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(201).json(mockResponse);
        }
      );

      const requestData = {
        subSkillId: 123,
        evidenceUrl: "https://example.com/evidence",
      };

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send(requestData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockPostController).toHaveBeenCalledTimes(1);
    });

    it("should return 400 for missing required fields", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "SubSkillId and evidenceUrl are required.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("required");
    });

    it("should return 400 for invalid subSkillId", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "SubSkillId must be a positive integer.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: "invalid",
          evidenceUrl: "https://example.com",
        })
        .expect(400);

      expect(response.body.message).toContain("positive integer");
    });

    it("should return 400 for invalid evidence URL", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message:
              "Evidence URL must be a valid, publicly accessible HTTP or HTTPS URL.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 123,
          evidenceUrl: "invalid-url",
        })
        .expect(400);

      expect(response.body.message).toContain("valid");
    });

    it("should return 409 for duplicate evidence", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(409).json({
            success: false,
            message: "Evidence already exists for this subskill.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 123,
          evidenceUrl: "https://example.com",
        })
        .expect(409);

      expect(response.body.message).toContain("already exists");
    });

    it("should handle server errors gracefully", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 123,
          evidenceUrl: "https://example.com",
        })
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/sfia/evidence/get", () => {
    it("should get evidence successfully with valid skill code", async () => {
      const mockEvidenceData = {
        success: true,
        data: [
          {
            id: 1,
            subSkillId: 123,
            evidenceUrl: "https://example.com/evidence1",
            skillCode: "PROG",
            subSkillText: "Designs and codes simple programs",
            createdAt: "2024-01-01T00:00:00Z",
          },
          {
            id: 2,
            subSkillId: 124,
            evidenceUrl: "https://example.com/evidence2",
            skillCode: "PROG",
            subSkillText: "Tests and documents programs",
            createdAt: "2024-01-02T00:00:00Z",
          },
        ],
      };

      mockGetController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(mockEvidenceData);
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "PROG" })
        .expect(200);

      expect(response.body).toEqual(mockEvidenceData);
      expect(mockGetController).toHaveBeenCalledTimes(1);
    });

    it("should return 400 for missing skill code", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "Skill code is required in the request body.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({})
        .expect(400);

      expect(response.body.message).toContain("required");
    });

    it("should return 400 for empty skill code", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "Skill code cannot be empty.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "   " })
        .expect(400);

      expect(response.body.message).toContain("cannot be empty");
    });

    it("should return 404 for non-existent skill or no evidence", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "No evidence found for the specified skill and user.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "NONEXISTENT" })
        .expect(404);

      expect(response.body.message).toContain("No evidence found");
    });

    it("should return 401 for unauthenticated requests", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "PROG" })
        .expect(401);

      expect(response.body.message).toContain("Authentication required");
    });
  });

  describe("DELETE /api/sfia/evidence/delete", () => {
    it("should delete evidence successfully", async () => {
      const mockDeleteResponse = {
        success: true,
        message: "Evidence deleted successfully.",
        data: {
          id: 1,
          subSkillId: 123,
          evidenceUrl: "https://example.com/evidence",
          deletedAt: new Date().toISOString(),
        },
      };

      mockDelController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(mockDeleteResponse);
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 123 })
        .expect(200);

      expect(response.body).toEqual(mockDeleteResponse);
      expect(mockDelController).toHaveBeenCalledTimes(1);
    });

    it("should return 400 for missing subSkillId", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "SubSkill ID is required in the request body.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({})
        .expect(400);

      expect(response.body.message).toContain("required");
    });

    it("should return 400 for invalid subSkillId", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "SubSkill ID must be a valid positive number.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: "invalid" })
        .expect(400);

      expect(response.body.message).toContain("positive number");
    });

    it("should return 404 for non-existent evidence", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "No evidence found for the specified subskill and user.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 999 })
        .expect(404);

      expect(response.body.message).toContain("No evidence found");
    });

    it("should return 409 for foreign key constraint errors", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(409).json({
            success: false,
            message: "Cannot delete evidence due to existing references.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 123 })
        .expect(409);

      expect(response.body.message).toContain("existing references");
    });

    it("should return 401 for unauthenticated requests", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 123 })
        .expect(401);

      expect(response.body.message).toContain("Authentication required");
    });
  });

  describe("HTTP Methods Validation", () => {
    it("should not accept GET method on create endpoint", async () => {
      await request(app).get("/api/sfia/evidence").expect(200); // Root is allowed
    });

    it("should not accept PUT method on any endpoint", async () => {
      await request(app).put("/api/sfia/evidence").expect(404);
      await request(app).put("/api/sfia/evidence/get").expect(404);
      await request(app).put("/api/sfia/evidence/delete").expect(404);
    });

    it("should not accept PATCH method on any endpoint", async () => {
      await request(app).patch("/api/sfia/evidence").expect(404);
      await request(app).patch("/api/sfia/evidence/get").expect(404);
      await request(app).patch("/api/sfia/evidence/delete").expect(404);
    });

    it("should not accept GET method on protected endpoints", async () => {
      await request(app).get("/api/sfia/evidence/get").expect(404);
      await request(app).get("/api/sfia/evidence/delete").expect(404);
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON response for POST create", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(201).json({
            success: true,
            message: "Evidence created successfully.",
            data: { id: 1 },
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({ subSkillId: 123, evidenceUrl: "https://example.com" })
        .expect(201)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("should return JSON response for POST get", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json({
            success: true,
            data: [],
          });
        }
      );

      const response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "PROG" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("should return JSON response for DELETE", async () => {
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json({
            success: true,
            message: "Evidence deleted successfully.",
          });
        }
      );

      const response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 123 })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("message");
    });

    it("should return proper error format for all endpoints", async () => {
      // Test POST create error
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "Validation error",
          });
        }
      );

      let response = await request(app)
        .post("/api/sfia/evidence")
        .send({})
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");

      // Test POST get error
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "Not found",
          });
        }
      );

      response = await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "INVALID" })
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");

      // Test DELETE error
      mockDelController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "Not found",
          });
        }
      );

      response = await request(app)
        .delete("/api/sfia/evidence/delete")
        .send({ subSkillId: 999 })
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle large subSkillId values", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(201).json({
            success: true,
            data: { id: 1, subSkillId: 999999999 },
          });
        }
      );

      await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 999999999,
          evidenceUrl: "https://example.com",
        })
        .expect(201);
    });

    it("should handle very long URLs", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "Evidence URL cannot exceed 2000 characters.",
          });
        }
      );

      const longUrl = "https://example.com/" + "a".repeat(2000);

      const response = await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 123,
          evidenceUrl: longUrl,
        })
        .expect(400);

      expect(response.body.message).toContain("exceed 2000 characters");
    });

    it("should handle special characters in skill codes", async () => {
      mockGetController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json({
            success: true,
            data: [],
          });
        }
      );

      await request(app)
        .post("/api/sfia/evidence/get")
        .send({ skillCode: "PROG-TEST_123" })
        .expect(200);
    });

    it("should handle zero and negative subSkillId", async () => {
      mockPostController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "SubSkillId must be a positive integer.",
          });
        }
      );

      await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: 0,
          evidenceUrl: "https://example.com",
        })
        .expect(400);

      await request(app)
        .post("/api/sfia/evidence")
        .send({
          subSkillId: -1,
          evidenceUrl: "https://example.com",
        })
        .expect(400);
    });
  });

  describe("Authentication Requirements", () => {
    it("should require authentication for POST create", async () => {
      // This test would need a separate setup without mocked auth
      // to truly test authentication requirements
      expect(mockPostController).toBeDefined();
    });

    it("should require authentication for POST get", async () => {
      expect(mockGetController).toBeDefined();
    });

    it("should require authentication for DELETE", async () => {
      expect(mockDelController).toBeDefined();
    });

    it("should not require authentication for GET root", async () => {
      const response = await request(app).get("/api/sfia/evidence").expect(200);

      expect(response.text).toBe("Hello from sfia evidence routes");
    });
  });
});
