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
import express, { Request, Response } from "express";
import tpqiUnitcodeRoutes from "./tpqiUnitcodeRoutes";
import * as getUnitcodeDetailController from "../controllers/getUnitcodeDetailController";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/tpqi/unitcodes", tpqiUnitcodeRoutes);

// Mock the controller functions
vi.mock("../controllers/getUnitcodeDetailController", () => ({
  getUnitCodeDetailController: vi.fn(),
}));

const mockController =
  getUnitcodeDetailController.getUnitCodeDetailController as any;

describe("TPQI Unit Code Routes", () => {
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

  describe("GET /api/tpqi/unitcodes", () => {
    it("should return hello message from root endpoint", async () => {
      const response = await request(app)
        .get("/api/tpqi/unitcodes")
        .expect(200);

      expect(response.text).toBe("Hello from tpqi unit code routes");
    });
  });

  describe("GET /api/tpqi/unitcodes/:unitCode", () => {
    it("should return unit code details for valid unit code", async () => {
      const mockUnitCodeDetails = {
        success: true,
        data: {
          unitCode: "ICT30115",
          unitTitle: "Certificate III in Information Technology",
          description:
            "This qualification reflects the role of individuals in a variety of information and communications technology (ICT) roles...",
          sector: "Information and Communication Technology",
          skills: [
            {
              id: 1,
              skill_code: "BSBCMM211",
              skill_title: "Apply communication skills",
              skill_description:
                "This unit describes the skills and knowledge required to communicate effectively in the workplace...",
              skill_type: "Core",
              elements: [
                {
                  id: 101,
                  element_number: "1",
                  element_title: "Gather information",
                  element_description:
                    "Information is gathered from appropriate sources to support workplace communication",
                  performance_criteria: [
                    {
                      id: 1001,
                      criteria_number: "1.1",
                      criteria_text:
                        "Information requirements are identified and sourced from appropriate people and resources",
                    },
                    {
                      id: 1002,
                      criteria_number: "1.2",
                      criteria_text:
                        "Information is checked for accuracy and currency before use",
                    },
                  ],
                },
              ],
            },
          ],
          knowledge: [
            {
              id: 1,
              knowledge_text: "Communication techniques and barriers",
              knowledge_category: "General",
            },
            {
              id: 2,
              knowledge_text: "Workplace communication protocols",
              knowledge_category: "Workplace",
            },
          ],
          totalSkills: 12,
          totalKnowledge: 8,
          totalElements: 45,
        },
      };

      mockController.mockImplementation(async (req: Request, res: Response) => {
        res.status(200).json(mockUnitCodeDetails);
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ICT30115")
        .expect(200);

      expect(response.body).toEqual(mockUnitCodeDetails);
      expect(mockController).toHaveBeenCalledTimes(1);
    });

    it("should return 404 for non-existent unit code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Unit code with code 'NONEXISTENT' not found.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/NONEXISTENT")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("not found");
    });

    it("should return 400 for empty unit code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(400).json({
          success: false,
          message: "Unit code is required and cannot be empty.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/%20")
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("required");
    });

    it("should handle server errors gracefully", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(500).json({
          success: false,
          message: "Internal server error.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ERROR")
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle database connection errors", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(500).json({
          success: false,
          message: "Failed to fetch unit code details. Please try again later.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ICT30115")
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain(
        "Failed to fetch unit code details"
      );
    });

    it("should accept various unit code formats", async () => {
      const unitCodes = ["ICT30115", "BSB30120", "SIT30116", "MST30116"];

      for (const unitCode of unitCodes) {
        mockController.mockImplementation((req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            data: {
              unitCode: unitCode,
              unitTitle: `${unitCode} qualification`,
              description: "Description...",
              skills: [],
              knowledge: [],
              totalSkills: 0,
              totalKnowledge: 0,
              totalElements: 0,
            },
          });
        });

        await request(app).get(`/api/tpqi/unitcodes/${unitCode}`).expect(200);
      }
    });

    it("should handle special characters in unit code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Unit code with code 'ICT30115@123' not found.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ICT30115@123")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });

    it("should handle very long unit codes", async () => {
      const longUnitCode = "ICT" + "A".repeat(100);

      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: `Unit code with code '${longUnitCode}' not found.`,
        });
      });

      const response = await request(app)
        .get(`/api/tpqi/unitcodes/${longUnitCode}`)
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });

    it("should handle unit codes with numbers only", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: "123456",
            unitTitle: "Numeric unit code",
            skills: [],
            knowledge: [],
          },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/123456").expect(200);
    });

    it("should handle unit codes with mixed case", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: "IcT30115",
            unitTitle: "Mixed case unit code",
            skills: [],
            knowledge: [],
          },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/IcT30115").expect(200);
    });
  });

  describe("Route Parameter Validation", () => {
    it("should pass unitCode parameter to controller", async () => {
      let capturedParams: any = null;

      mockController.mockImplementation((req: Request, res: Response) => {
        capturedParams = req.params;
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get("/api/tpqi/unitcodes/TESTCODE").expect(200);

      expect(capturedParams).toHaveProperty("unitCode", "TESTCODE");
    });

    it("should handle URL encoded unit codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: req.params.unitCode,
            unitTitle: "Test unit",
            skills: [],
            knowledge: [],
          },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/ICT%2B30115").expect(200);
    });

    it("should handle unit codes with spaces (URL encoded)", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: req.params.unitCode,
            unitTitle: "Unit with spaces",
            skills: [],
            knowledge: [],
          },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/ICT%2030115").expect(200);
    });
  });

  describe("HTTP Methods", () => {
    it("should not accept POST method on unit code detail endpoint", async () => {
      await request(app).post("/api/tpqi/unitcodes/ICT30115").expect(404);
    });

    it("should not accept PUT method on unit code detail endpoint", async () => {
      await request(app).put("/api/tpqi/unitcodes/ICT30115").expect(404);
    });

    it("should not accept DELETE method on unit code detail endpoint", async () => {
      await request(app).delete("/api/tpqi/unitcodes/ICT30115").expect(404);
    });

    it("should not accept PATCH method on unit code detail endpoint", async () => {
      await request(app).patch("/api/tpqi/unitcodes/ICT30115").expect(404);
    });

    it("should not accept POST method on root endpoint", async () => {
      await request(app).post("/api/tpqi/unitcodes").expect(404);
    });

    it("should not accept PUT method on root endpoint", async () => {
      await request(app).put("/api/tpqi/unitcodes").expect(404);
    });

    it("should not accept DELETE method on root endpoint", async () => {
      await request(app).delete("/api/tpqi/unitcodes").expect(404);
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON response for unit code details", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "ICT30115", unitTitle: "Test Unit" },
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ICT30115")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("should return proper error format", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Unit code not found",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/NOTFOUND")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should return consistent success response structure", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: "ICT30115",
            unitTitle: "Test Unit",
            skills: [],
            knowledge: [],
            totalSkills: 0,
            totalKnowledge: 0,
          },
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ICT30115")
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("unitCode");
      expect(response.body.data).toHaveProperty("unitTitle");
    });
  });

  describe("Edge Cases", () => {
    it("should handle numeric unit codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "123", unitTitle: "Numeric unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/123").expect(200);
    });

    it("should handle mixed case unit codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "IcT30115", unitTitle: "Mixed case unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/IcT30115").expect(200);
    });

    it("should handle single character unit codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "A", unitTitle: "Single char unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/A").expect(200);
    });

    it("should handle unit codes with hyphens", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "ICT-30115", unitTitle: "Hyphenated unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/ICT-30115").expect(200);
    });

    it("should handle unit codes with underscores", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "ICT_30115", unitTitle: "Underscore unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/ICT_30115").expect(200);
    });

    it("should handle empty response data gracefully", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            unitCode: "EMPTY01",
            unitTitle: "Empty Unit",
            skills: [],
            knowledge: [],
            totalSkills: 0,
            totalKnowledge: 0,
            totalElements: 0,
          },
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/EMPTY01")
        .expect(200);

      expect(response.body.data.skills).toEqual([]);
      expect(response.body.data.knowledge).toEqual([]);
      expect(response.body.data.totalSkills).toBe(0);
    });

    it("should handle very short unit codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { unitCode: "AB", unitTitle: "Short unit" },
        });
      });

      await request(app).get("/api/tpqi/unitcodes/AB").expect(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle service layer exceptions", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(500).json({
          success: false,
          message: "Failed to fetch unit code details. Please try again later.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/ERROR")
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Failed to fetch");
    });

    it("should handle unexpected errors", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(500).json({
          success: false,
          message: "Internal server error.",
        });
      });

      const response = await request(app)
        .get("/api/tpqi/unitcodes/UNEXPECTED")
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error.");
    });

    it("should maintain error response format consistency", async () => {
      const errorScenarios = [
        { status: 400, message: "Bad request" },
        { status: 404, message: "Not found" },
        { status: 500, message: "Internal server error" },
      ];

      for (const scenario of errorScenarios) {
        mockController.mockImplementation((req: Request, res: Response) => {
          res.status(scenario.status).json({
            success: false,
            message: scenario.message,
          });
        });

        const response = await request(app)
          .get("/api/tpqi/unitcodes/TEST")
          .expect(scenario.status);

        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
      }
    });
  });
});
