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
import sfiaSkillRoutes from "./sfiaSkillRoutes";
import * as getSkillDetailController from "../controllers/getSkillDetailController";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/sfia/skills", sfiaSkillRoutes);

// Mock the controller functions
vi.mock("../controllers/getSkillDetailController", () => ({
  getSkillDetailController: vi.fn(),
}));

const mockController = getSkillDetailController.getSkillDetailController as any;

describe("SFIA Skill Routes", () => {
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

  describe("GET /api/sfia/skills", () => {
    it("should return hello message from root endpoint", async () => {
      const response = await request(app).get("/api/sfia/skills").expect(200);

      expect(response.text).toBe("Hello from sfia skill routes");
    });
  });

  describe("GET /api/sfia/skills/:skillCode", () => {
    it("should return skill details for valid skill code", async () => {
      const mockSkillDetails = {
        success: true,
        data: {
          competency: {
            competency_id: "PROG",
            competency_name: "Programming/software development",
            overall:
              "Developing software components to deliver value to stakeholders.",
            note: "Activities may include, but are not limited to: identifying, creating and applying software development and security standards and processes planning and designing software components estimating time and effort required for software development constructing, amending, and verifying software components, ensuring security is embedded applying test-driven development and ensuring appropriate test coverage using peer review techniques such as pair programming documenting software components understanding and obtaining agreement to the value of the software components to be developed selecting appropriate development methods and lifecycles applying recovery techniques to ensure the software being developed is not lost  implementing appropriate change control to software development practices resolving operational problems with software and fixing bugs Depending on requirements and the characteristics of the project or assigned work, software development methods and lifecycles can be predictive (plan-",
            category: {
              id: 3,
              category_text: "Development and implementation",
            },
            levels: [
              {
                id: 387,
                level_name: "2",
                descriptions: [
                  {
                    id: 238,
                    description_text:
                      "Designs, codes, verifies, tests, documents, amends and refactors simple programs/scripts.  Applies agreed standards, tools and basic security practices to achieve a well-engineered result. Reviews own work.",
                    subskills: [
                      {
                        id: 5200,
                        subskill_text:
                          "Designs, codes, verifies, tests, documents, amends and refactors simple programs/scripts",
                      },
                      {
                        id: 5201,
                        subskill_text:
                          "Applies agreed standards, tools and basic security practices to achieve a well-engineered result",
                      },
                      {
                        id: 5202,
                        subskill_text: "Reviews own work",
                      },
                    ],
                  },
                ],
              },
              {
                id: 388,
                level_name: "3",
                descriptions: [
                  {
                    id: 239,
                    description_text:
                      "Designs, codes, verifies, tests, documents, amends and refactors moderately complex programs/scripts.  Applies agreed standards, tools and security measures to achieve a well-engineered result. Monitors and reports on progress. Identifies issues related to software development activities. Proposes practical solutions to resolve issues. Collaborates in reviews of work with others as appropriate.",
                    subskills: [
                      {
                        id: 5203,
                        subskill_text:
                          "Designs, codes, verifies, tests, documents, amends and refactors moderately complex programs/scripts",
                      },
                      {
                        id: 5204,
                        subskill_text:
                          "Applies agreed standards, tools and security measures to achieve a well-engineered result",
                      },
                      {
                        id: 5205,
                        subskill_text: "Monitors and reports on progress",
                      },
                      {
                        id: 5206,
                        subskill_text:
                          "Identifies issues related to software development activities",
                      },
                      {
                        id: 5207,
                        subskill_text:
                          "Proposes practical solutions to resolve issues",
                      },
                      {
                        id: 5208,
                        subskill_text:
                          "Collaborates in reviews of work with others as appropriate",
                      },
                    ],
                  },
                ],
              },
              {
                id: 389,
                level_name: "4",
                descriptions: [
                  {
                    id: 240,
                    description_text:
                      "Designs, codes, verifies, tests, documents, amends and refactors complex programs/scripts and integration software services.  Contributes to the selection of the software development methods, tools, techniques, and security practices. Applies agreed standards, tools, and security measures to achieve well-engineered outcomes. Participates in reviews of own work and leads reviews of colleagues' work.",
                    subskills: [
                      {
                        id: 5209,
                        subskill_text:
                          "Designs, codes, verifies, tests, documents, amends and refactors complex programs/scripts and integration software services",
                      },
                      {
                        id: 5210,
                        subskill_text:
                          "Contributes to the selection of the software development methods, tools, techniques, and security practices",
                      },
                      {
                        id: 5211,
                        subskill_text:
                          "Applies agreed standards, tools, and security measures to achieve well-engineered outcomes",
                      },
                      {
                        id: 5212,
                        subskill_text:
                          "Participates in reviews of own work and leads reviews of colleagues' work",
                      },
                    ],
                  },
                ],
              },
              {
                id: 390,
                level_name: "5",
                descriptions: [
                  {
                    id: 241,
                    description_text:
                      "Takes technical responsibility across all stages and iterations of software development.  Plans and drives software construction activities. Adopts and adapts appropriate software development methods, tools and techniques.  Measures and monitors applications of project/team standards for software construction, including software security.  Contributes to the development of organisational policies, standards and guidelines for software development.",
                    subskills: [
                      {
                        id: 5213,
                        subskill_text:
                          "Takes technical responsibility across all stages and iterations of software development",
                      },
                      {
                        id: 5214,
                        subskill_text:
                          "Plans and drives software construction activities",
                      },
                      {
                        id: 5215,
                        subskill_text:
                          "Adopts and adapts appropriate software development methods, tools and techniques",
                      },
                      {
                        id: 5216,
                        subskill_text:
                          "Measures and monitors applications of project/team standards for software construction, including software security",
                      },
                      {
                        id: 5217,
                        subskill_text:
                          "Contributes to the development of organisational policies, standards and guidelines for software development",
                      },
                    ],
                  },
                ],
              },
              {
                id: 391,
                level_name: "6",
                descriptions: [
                  {
                    id: 242,
                    description_text:
                      "Develops organisational policies, standards and guidelines for software construction and refactoring.  Plans and leads software construction activities for strategic, large and complex development projects.  Adapts or develops new methods and organisational capabilities and drives adoption of, and adherence to, policies and standards.",
                    subskills: [
                      {
                        id: 5218,
                        subskill_text:
                          "Develops organisational policies, standards and guidelines for software construction and refactoring",
                      },
                      {
                        id: 5219,
                        subskill_text:
                          "Plans and leads software construction activities for strategic, large and complex development projects",
                      },
                      {
                        id: 5220,
                        subskill_text:
                          "Adapts or develops new methods and organisational capabilities and drives adoption of, and adherence to, policies and standards",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          totalLevels: 5,
          totalSubSkills: 21,
        },
      };

      mockController.mockImplementation(async (req: Request, res: Response) => {
        res.status(200).json(mockSkillDetails);
      });

      const response = await request(app)
        .get("/api/sfia/skills/PROG")
        .expect(200);

      expect(response.body).toEqual(mockSkillDetails);
      expect(mockController).toHaveBeenCalledTimes(1);
    });

    it("should return 404 for non-existent skill code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Skill with code 'NONEXISTENT' not found.",
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/NONEXISTENT")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("not found");
    });

    it("should return 400 for empty skill code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(400).json({
          success: false,
          message: "Skill code is required and cannot be empty.",
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/%20")
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
        .get("/api/sfia/skills/ERROR")
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle database connection errors", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(500).json({
          success: false,
          message: "Failed to fetch skill details. Please try again later.",
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/PROG")
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("Failed to fetch skill details");
    });

    it("should accept various skill code formats", async () => {
      const skillCodes = ["PROG", "SYAD", "REQM", "DTAN"];

      for (const skillCode of skillCodes) {
        mockController.mockImplementation((req: Request, res: Response) => {
          res.status(200).json({
            success: true,
            data: {
              competency: {
                competency_id: skillCode,
                competency_name: `${skillCode} skill`,
                overall: "Description...",
                levels: [],
              },
              totalLevels: 0,
              totalSubSkills: 0,
            },
          });
        });

        await request(app).get(`/api/sfia/skills/${skillCode}`).expect(200);
      }
    });

    it("should handle special characters in skill code", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Skill with code 'PROG@123' not found.",
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/PROG@123")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });

    it("should handle very long skill codes", async () => {
      const longSkillCode = "A".repeat(100);

      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: `Skill with code '${longSkillCode}' not found.`,
        });
      });

      const response = await request(app)
        .get(`/api/sfia/skills/${longSkillCode}`)
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("Route Parameter Validation", () => {
    it("should pass skillCode parameter to controller", async () => {
      let capturedParams: any = null;

      mockController.mockImplementation((req: Request, res: Response) => {
        capturedParams = req.params;
        res.status(200).json({ success: true, data: {} });
      });

      await request(app).get("/api/sfia/skills/TESTCODE").expect(200);

      expect(capturedParams).toHaveProperty("skillCode", "TESTCODE");
    });

    it("should handle URL encoded skill codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: {
            competency: {
              competency_id: req.params.skillCode,
              competency_name: "Test skill",
              levels: [],
            },
          },
        });
      });

      await request(app).get("/api/sfia/skills/PROG%2BTEST").expect(200);
    });
  });

  describe("HTTP Methods", () => {
    it("should not accept POST method on skill detail endpoint", async () => {
      await request(app).post("/api/sfia/skills/PROG").expect(404);
    });

    it("should not accept PUT method on skill detail endpoint", async () => {
      await request(app).put("/api/sfia/skills/PROG").expect(404);
    });

    it("should not accept DELETE method on skill detail endpoint", async () => {
      await request(app).delete("/api/sfia/skills/PROG").expect(404);
    });

    it("should not accept PATCH method on skill detail endpoint", async () => {
      await request(app).patch("/api/sfia/skills/PROG").expect(404);
    });

    it("should not accept POST method on root endpoint", async () => {
      await request(app).post("/api/sfia/skills").expect(404);
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON response for skill details", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { competency: { competency_id: "PROG" } },
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/PROG")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });

    it("should return proper error format", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          message: "Skill not found",
        });
      });

      const response = await request(app)
        .get("/api/sfia/skills/NOTFOUND")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle numeric skill codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { competency: { competency_id: "123" } },
        });
      });

      await request(app).get("/api/sfia/skills/123").expect(200);
    });

    it("should handle mixed case skill codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { competency: { competency_id: "PrOg" } },
        });
      });

      await request(app).get("/api/sfia/skills/PrOg").expect(200);
    });

    it("should handle single character skill codes", async () => {
      mockController.mockImplementation((req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          data: { competency: { competency_id: "A" } },
        });
      });

      await request(app).get("/api/sfia/skills/A").expect(200);
    });
  });
});
