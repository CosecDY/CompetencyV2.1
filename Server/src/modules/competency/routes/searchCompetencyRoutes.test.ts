import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import searchCompetencyRoutes from "./searchCompetencyRoutes";
import * as searchCompetencyController from "@Competency/controllers/searchCompetencyController";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/competency/search", searchCompetencyRoutes);

// Mock the controller functions
vi.mock("@Competency/controllers/searchCompetencyController", () => ({
  getCompetencies: vi.fn(),
  searchCompetency: vi.fn(),
}));

describe("Search Competency Routes", () => {
  beforeAll(() => {
    // Setup any necessary test data or configurations
  });

  afterAll(() => {
    // Cleanup after tests
    vi.clearAllMocks();
  });

  describe("GET /api/competency/search/:dbType", () => {
    it("should return all competencies for SFIA database", async () => {
      // Mock the controller response
      const mockCompetencies = [
        "Software Engineer",
        "Data Scientist",
        "DevOps Engineer",
      ];
      (searchCompetencyController.getCompetencies as any).mockImplementation(
        (req, res) => {
          res.status(200).json(mockCompetencies);
        }
      );

      const response = await request(app)
        .get("/api/competency/search/sfia")
        .expect(200);

      expect(response.body).toEqual(mockCompetencies);
      expect(searchCompetencyController.getCompetencies).toHaveBeenCalledTimes(
        1
      );
    });

    it("should return all competencies for TPQI database", async () => {
      const mockCompetencies = [
        "Security Analyst",
        "Cybersecurity Engineer",
        "Network Administrator",
      ];
      (searchCompetencyController.getCompetencies as any).mockImplementation(
        (req, res) => {
          res.status(200).json(mockCompetencies);
        }
      );

      const response = await request(app)
        .get("/api/competency/search/tpqi")
        .expect(200);

      expect(response.body).toEqual(mockCompetencies);
    });

    it("should handle invalid database type gracefully", async () => {
      (searchCompetencyController.getCompetencies as any).mockImplementation(
        (req, res) => {
          res.status(400).json({ error: "Invalid database type" });
        }
      );

      const response = await request(app)
        .get("/api/competency/search/invalid")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle server errors", async () => {
      (searchCompetencyController.getCompetencies as any).mockImplementation(
        (req, res) => {
          res.status(500).json({ error: "Internal server error" });
        }
      );

      await request(app).get("/api/competency/search/sfia").expect(500);
    });
  });

  describe("POST /api/competency/search/:dbType", () => {
    it("should return filtered competencies based on search term for SFIA", async () => {
      const mockSearchResults = ["Software Engineer", "Software Architect"];
      (searchCompetencyController.searchCompetency as any).mockImplementation(
        (req, res) => {
          res.status(200).json(mockSearchResults);
        }
      );

      const response = await request(app)
        .post("/api/competency/search/sfia")
        .send({ searchTerm: "software" })
        .expect(200);

      expect(response.body).toEqual(mockSearchResults);
      expect(searchCompetencyController.searchCompetency).toHaveBeenCalledTimes(
        1
      );
    });

    it("should return filtered competencies based on search term for TPQI", async () => {
      const mockSearchResults = ["Security Analyst", "Cybersecurity Engineer"];
      (searchCompetencyController.searchCompetency as any).mockImplementation(
        (req, res) => {
          res.status(200).json(mockSearchResults);
        }
      );

      const response = await request(app)
        .post("/api/competency/search/tpqi")
        .send({ searchTerm: "sec" })
        .expect(200);

      expect(response.body).toEqual(mockSearchResults);
    });

    it("should handle empty search term", async () => {
      (searchCompetencyController.searchCompetency as any).mockImplementation(
        (req, res) => {
          res.status(400).json({ error: "Search term is required" });
        }
      );

      const response = await request(app)
        .post("/api/competency/search/sfia")
        .send({ searchTerm: "" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle missing search term in request body", async () => {
      (searchCompetencyController.searchCompetency as any).mockImplementation(
        (req, res) => {
          res.status(400).json({ error: "Search term is required" });
        }
      );

      const response = await request(app)
        .post("/api/competency/search/sfia")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return empty array when no matches found", async () => {
      (searchCompetencyController.searchCompetency as any).mockImplementation(
        (req, res) => {
          res.status(200).json([]);
        }
      );

      const response = await request(app)
        .post("/api/competency/search/sfia")
        .send({ searchTerm: "nonexistent" })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/api/competency/search/sfia")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);
    });
  });

  describe("Route Parameter Validation", () => {
    it("should accept valid dbType parameters", async () => {
      const validDbTypes = ["sfia", "tpqi"];

      for (const dbType of validDbTypes) {
        (searchCompetencyController.getCompetencies as any).mockImplementation(
          (req, res) => {
            res.status(200).json([]);
          }
        );

        await request(app).get(`/api/competency/search/${dbType}`).expect(200);
      }
    });
  });

  describe("HTTP Methods", () => {
    it("should not accept PUT method on search endpoint", async () => {
      await request(app).put("/api/competency/search/sfia").expect(404);
    });

    it("should not accept DELETE method on search endpoint", async () => {
      await request(app).delete("/api/competency/search/sfia").expect(404);
    });

    it("should not accept PATCH method on search endpoint", async () => {
      await request(app).patch("/api/competency/search/sfia").expect(404);
    });
  });
});
