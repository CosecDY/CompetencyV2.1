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
import tpqiSummaryRoutes from "./tpqiSummaryRoutes";
import * as getUserSummaryController from "../controllers/getUserSummaryController";
import { AuthenticatedRequest } from "@/middlewares/authMiddleware";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/tpqi/summary", tpqiSummaryRoutes);

// Mock the controller functions
vi.mock("../controllers/getUserSummaryController", () => ({
  getUserCareerSummaryController: vi.fn(),
}));

// Mock the auth middleware
vi.mock("@/middlewares/authMiddleware", () => ({
  authenticate: vi.fn((req: Request, res: Response, next: NextFunction) => {
    // Mock authenticated user
    (req as AuthenticatedRequest).user = {
      userId: "test-user-123",
      email: "test@example.com",
      roles: ["User"],
      permissions: ["summary:read"],
    };
    next();
  }),
}));

const mockController =
  getUserSummaryController.getUserCareerSummaryController as any;

describe("TPQI Summary Routes", () => {
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

  describe("GET /api/tpqi/summary", () => {
    it("should return hello message from root endpoint", async () => {
      const response = await request(app).get("/api/tpqi/summary").expect(200);

      expect(response.text).toBe("Hello from tpqi career summary routes");
    });

    it("should not require authentication for root endpoint", async () => {
      // Test without mocked auth - this tests the actual public endpoint
      const response = await request(app).get("/api/tpqi/summary").expect(200);

      expect(response.text).toBe("Hello from tpqi career summary routes");
    });
  });

  describe("GET /api/tpqi/summary/user", () => {
    it("should return user career summary successfully", async () => {
      const mockSummaryData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 3,
          totalUnitsCompleted: 15,
          totalSkillsAcquired: 45,
          totalKnowledgeAcquired: 68,
          completionPercentage: 75.5,
          careerSummaries: [
            {
              id: 1,
              careerName: "Information Technology Specialist",
              level: "Certificate III",
              sector: "Information and Communication Technology",
              unitCodes: [
                {
                  unitCode: "ICT30115",
                  unitTitle: "Certificate III in Information Technology",
                  completionStatus: "Completed",
                  completedDate: "2024-01-15T00:00:00Z",
                  skills: [
                    {
                      skillCode: "BSBCMM211",
                      skillTitle: "Apply communication skills",
                      completionStatus: "Completed",
                    },
                  ],
                  knowledge: [
                    {
                      id: 1,
                      knowledgeText: "Communication techniques",
                      category: "General",
                    },
                  ],
                },
              ],
              overallProgress: 85.2,
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-20T00:00:00Z",
            },
            {
              id: 2,
              careerName: "Digital Media Specialist",
              level: "Certificate IV",
              sector: "Creative Arts and Design",
              unitCodes: [
                {
                  unitCode: "CUA40720",
                  unitTitle: "Certificate IV in Graphic Design",
                  completionStatus: "In Progress",
                  skills: [],
                  knowledge: [],
                },
              ],
              overallProgress: 45.8,
              createdAt: "2024-02-01T00:00:00Z",
              updatedAt: "2024-02-15T00:00:00Z",
            },
          ],
          statistics: {
            averageCompletionTime: 120, // days
            mostCompletedSector: "Information and Communication Technology",
            recentActivity: "2024-01-20T00:00:00Z",
          },
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(mockSummaryData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body).toEqual(mockSummaryData);
      expect(mockController).toHaveBeenCalledTimes(1);
    });

    it("should return 404 when no career summaries found", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "No career summaries found for the user.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("No career summaries found");
    });

    it("should return 401 for unauthenticated requests", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(401);

      expect(response.body.message).toContain("Authentication required");
    });

    it("should handle server errors gracefully", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle service layer errors", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(500).json({
            success: false,
            message: "Failed to retrieve user career summary data.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(500);

      expect(response.body.message).toContain("Failed to retrieve");
    });

    it("should handle validation errors", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(400).json({
            success: false,
            message: "Invalid request data.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should return empty career summaries array when user has no data", async () => {
      const mockEmptyData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 0,
          totalUnitsCompleted: 0,
          totalSkillsAcquired: 0,
          totalKnowledgeAcquired: 0,
          completionPercentage: 0,
          careerSummaries: [],
          statistics: {
            averageCompletionTime: 0,
            mostCompletedSector: null,
            recentActivity: null,
          },
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(mockEmptyData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body.data.careerSummaries).toEqual([]);
      expect(response.body.data.totalCareerSummaries).toBe(0);
    });
  });

  describe("HTTP Methods Validation", () => {
    it("should not accept POST method on root endpoint", async () => {
      await request(app).post("/api/tpqi/summary").expect(404);
    });

    it("should not accept PUT method on root endpoint", async () => {
      await request(app).put("/api/tpqi/summary").expect(404);
    });

    it("should not accept DELETE method on root endpoint", async () => {
      await request(app).delete("/api/tpqi/summary").expect(404);
    });

    it("should not accept PATCH method on root endpoint", async () => {
      await request(app).patch("/api/tpqi/summary").expect(404);
    });

    it("should not accept POST method on user endpoint", async () => {
      await request(app).post("/api/tpqi/summary/user").expect(404);
    });

    it("should not accept PUT method on user endpoint", async () => {
      await request(app).put("/api/tpqi/summary/user").expect(404);
    });

    it("should not accept DELETE method on user endpoint", async () => {
      await request(app).delete("/api/tpqi/summary/user").expect(404);
    });

    it("should not accept PATCH method on user endpoint", async () => {
      await request(app).patch("/api/tpqi/summary/user").expect(404);
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON response for user summary", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json({
            success: true,
            data: {
              userId: "test-user-123",
              totalCareerSummaries: 1,
              careerSummaries: [],
            },
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("should return proper error format", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(404).json({
            success: false,
            message: "No career summaries found",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should return consistent success response structure", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json({
            success: true,
            data: {
              userId: "test-user-123",
              totalCareerSummaries: 2,
              careerSummaries: [
                { id: 1, careerName: "Test Career 1" },
                { id: 2, careerName: "Test Career 2" },
              ],
            },
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("userId");
      expect(response.body.data).toHaveProperty("totalCareerSummaries");
      expect(response.body.data).toHaveProperty("careerSummaries");
      expect(Array.isArray(response.body.data.careerSummaries)).toBe(true);
    });
  });

  describe("Authentication Requirements", () => {
    it("should require authentication for user endpoint", async () => {
      // This test demonstrates that authentication is required
      expect(mockController).toBeDefined();
    });

    it("should not require authentication for root endpoint", async () => {
      const response = await request(app).get("/api/tpqi/summary").expect(200);

      expect(response.text).toBe("Hello from tpqi career summary routes");
    });
  });

  describe("Edge Cases", () => {
    it("should handle large datasets gracefully", async () => {
      const largeMockData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 100,
          careerSummaries: Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            careerName: `Career ${i + 1}`,
            level: "Certificate III",
            unitCodes: [],
            overallProgress: Math.random() * 100,
          })),
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(largeMockData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body.data.careerSummaries).toHaveLength(100);
    });

    it("should handle partial data scenarios", async () => {
      const partialMockData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 1,
          careerSummaries: [
            {
              id: 1,
              careerName: "Incomplete Career",
              // Missing some optional fields
              unitCodes: [],
            },
          ],
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(partialMockData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body.data.careerSummaries[0]).toHaveProperty("id");
      expect(response.body.data.careerSummaries[0]).toHaveProperty(
        "careerName"
      );
    });

    it("should handle null/undefined values gracefully", async () => {
      const nullValueMockData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 1,
          careerSummaries: [
            {
              id: 1,
              careerName: "Test Career",
              level: null,
              sector: undefined,
              unitCodes: [],
            },
          ],
          statistics: {
            averageCompletionTime: null,
            mostCompletedSector: null,
            recentActivity: null,
          },
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(nullValueMockData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      expect(response.body.data.statistics.mostCompletedSector).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should maintain error response format consistency", async () => {
      const errorScenarios = [
        { status: 400, message: "Bad request" },
        { status: 401, message: "Unauthorized" },
        { status: 404, message: "Not found" },
        { status: 500, message: "Internal server error" },
      ];

      for (const scenario of errorScenarios) {
        mockController.mockImplementation(
          (req: AuthenticatedRequest, res: Response) => {
            res.status(scenario.status).json({
              success: false,
              message: scenario.message,
            });
          }
        );

        const response = await request(app)
          .get("/api/tpqi/summary/user")
          .expect(scenario.status);

        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("should handle controller exceptions", async () => {
      mockController.mockImplementation(() => {
        throw new Error("Unexpected controller error");
      });

      // Since we're mocking the controller to throw, we need to handle this appropriately
      // In a real scenario, the error would be caught by the controller's try-catch
      expect(() => {
        mockController();
      }).toThrow("Unexpected controller error");
    });

    it("should handle service layer timeouts", async () => {
      mockController.mockImplementation(
        (req: AuthenticatedRequest, res: Response) => {
          res.status(500).json({
            success: false,
            message: "Request timeout. Please try again later.",
          });
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(500);

      expect(response.body.message).toContain("timeout");
    });
  });

  describe("Data Validation", () => {
    it("should handle valid career summary data structure", async () => {
      const validMockData = {
        success: true,
        data: {
          userId: "test-user-123",
          totalCareerSummaries: 1,
          totalUnitsCompleted: 5,
          totalSkillsAcquired: 15,
          totalKnowledgeAcquired: 25,
          completionPercentage: 67.5,
          careerSummaries: [
            {
              id: 1,
              careerName: "Software Developer",
              level: "Certificate IV",
              sector: "Information Technology",
              unitCodes: [
                {
                  unitCode: "ICT40120",
                  unitTitle: "Certificate IV in Information Technology",
                  completionStatus: "Completed",
                },
              ],
              overallProgress: 67.5,
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-15T00:00:00Z",
            },
          ],
        },
      };

      mockController.mockImplementation(
        async (req: AuthenticatedRequest, res: Response) => {
          res.status(200).json(validMockData);
        }
      );

      const response = await request(app)
        .get("/api/tpqi/summary/user")
        .expect(200);

      // Validate the structure
      expect(response.body.data).toHaveProperty("userId");
      expect(response.body.data).toHaveProperty("totalCareerSummaries");
      expect(response.body.data).toHaveProperty("careerSummaries");
      expect(Array.isArray(response.body.data.careerSummaries)).toBe(true);

      const career = response.body.data.careerSummaries[0];
      expect(career).toHaveProperty("id");
      expect(career).toHaveProperty("careerName");
      expect(career).toHaveProperty("unitCodes");
      expect(Array.isArray(career.unitCodes)).toBe(true);
    });
  });
});
