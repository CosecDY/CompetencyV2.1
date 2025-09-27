import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import express from "express";
import sfiaSummaryRoutes from "./sfiaSummaryRoutes";
import * as getUserSummaryController from "../controllers/getUserSummaryController";
import { authenticate } from "@/middlewares/authMiddleware";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/sfia/summary", sfiaSummaryRoutes);

// Mock the controller functions
vi.mock("../controllers/getUserSummaryController", () => ({
  getUserSummaryController: vi.fn(),
}));

// Mock the authentication middleware
vi.mock("@/middlewares/authMiddleware", () => ({
  authenticate: vi.fn(),
}));

describe("SFIA Summary Routes", () => {
  beforeAll(() => {
    // Setup any necessary test data or configurations
  });

  afterAll(() => {
    // Cleanup after tests
    vi.clearAllMocks();
  });

  describe("GET /api/sfia/summary", () => {
    it("should return hello message for public endpoint", async () => {
      const response = await request(app).get("/api/sfia/summary").expect(200);

      expect(response.text).toBe("Hello from sfia user summary routes");
    });

    it("should be accessible without authentication", async () => {
      // This endpoint should not call the authenticate middleware
      await request(app).get("/api/sfia/summary").expect(200);

      expect(authenticate).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/sfia/summary/user", () => {
    beforeEach(() => {
      // Reset mocks before each test
      vi.clearAllMocks();
    });

    it("should return user skill summaries for authenticated user", async () => {
      // Mock successful authentication
      (authenticate as any).mockImplementation((req, res, next) => {
        req.user = { id: "user123", email: "test@example.com" };
        next();
      });

      // Mock the controller response
      const mockSummaries = [
        {
          skillId: "skill1",
          skillName: "Programming",
          level: 3,
          category: "Technical Skills",
        },
        {
          skillId: "skill2",
          skillName: "System Design",
          level: 4,
          category: "Technical Skills",
        },
      ];

      (
        getUserSummaryController.getUserSummaryController as any
      ).mockImplementation((req, res) => {
        res.status(200).json(mockSummaries);
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(200);

      expect(response.body).toEqual(mockSummaries);
      expect(authenticate).toHaveBeenCalledTimes(1);
      expect(
        getUserSummaryController.getUserSummaryController
      ).toHaveBeenCalledTimes(1);
    });

    it("should require authentication", async () => {
      // Mock authentication failure
      (authenticate as any).mockImplementation((req, res, next) => {
        res.status(401).json({ error: "Unauthorized" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Unauthorized");
      expect(authenticate).toHaveBeenCalledTimes(1);
      expect(
        getUserSummaryController.getUserSummaryController
      ).not.toHaveBeenCalled();
    });

    it("should handle missing token", async () => {
      (authenticate as any).mockImplementation((req, res, next) => {
        res.status(401).json({ error: "Access token is missing" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Access token is missing");
    });

    it("should handle invalid token", async () => {
      (authenticate as any).mockImplementation((req, res, next) => {
        res.status(401).json({ error: "Invalid token" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid token");
    });

    it("should handle controller errors", async () => {
      // Mock successful authentication
      (authenticate as any).mockImplementation((req, res, next) => {
        req.user = { id: "user123", email: "test@example.com" };
        next();
      });

      // Mock controller error
      (
        getUserSummaryController.getUserSummaryController as any
      ).mockImplementation((req, res) => {
        res.status(500).json({ error: "Internal server error" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(500);

      expect(response.body).toHaveProperty("error", "Internal server error");
    });

    it("should handle empty summaries", async () => {
      // Mock successful authentication
      (authenticate as any).mockImplementation((req, res, next) => {
        req.user = { id: "user123", email: "test@example.com" };
        next();
      });

      // Mock empty response
      (
        getUserSummaryController.getUserSummaryController as any
      ).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should handle database connection errors", async () => {
      // Mock successful authentication
      (authenticate as any).mockImplementation((req, res, next) => {
        req.user = { id: "user123", email: "test@example.com" };
        next();
      });

      // Mock database error
      (
        getUserSummaryController.getUserSummaryController as any
      ).mockImplementation((req, res) => {
        res.status(503).json({ error: "Database connection failed" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(503);

      expect(response.body).toHaveProperty(
        "error",
        "Database connection failed"
      );
    });
  });

  describe("HTTP Methods", () => {
    it("should not accept POST method on root endpoint", async () => {
      await request(app).post("/api/sfia/summary").expect(404);
    });

    it("should not accept PUT method on user endpoint", async () => {
      await request(app).put("/api/sfia/summary/user").expect(404);
    });

    it("should not accept DELETE method on user endpoint", async () => {
      await request(app).delete("/api/sfia/summary/user").expect(404);
    });

    it("should not accept PATCH method on user endpoint", async () => {
      await request(app).patch("/api/sfia/summary/user").expect(404);
    });

    it("should not accept POST method on user endpoint", async () => {
      await request(app).post("/api/sfia/summary/user").expect(404);
    });
  });

  describe("Route Structure", () => {
    it("should handle non-existent routes", async () => {
      await request(app).get("/api/sfia/summary/nonexistent").expect(404);
    });

    it("should handle routes with extra parameters", async () => {
      await request(app).get("/api/sfia/summary/user/extra").expect(404);
    });
  });

  describe("Authentication Middleware Integration", () => {
    it("should pass user information from auth middleware to controller", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "user",
      };

      // Mock successful authentication with user data
      (authenticate as any).mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      // Mock controller to capture request
      (
        getUserSummaryController.getUserSummaryController as any
      ).mockImplementation((req, res) => {
        expect(req.user).toEqual(mockUser);
        res.status(200).json([]);
      });

      await request(app).get("/api/sfia/summary/user").expect(200);
    });

    it("should handle expired tokens", async () => {
      (authenticate as any).mockImplementation((req, res, next) => {
        res.status(401).json({ error: "Token expired" });
      });

      const response = await request(app)
        .get("/api/sfia/summary/user")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Token expired");
    });
  });
});
