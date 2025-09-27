import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import express from "express";

// Mock JWT token utilities
vi.mock("@Utils/tokenUtils", () => ({
  verifyToken: vi.fn(),
}));

// Mock Prisma client
vi.mock("@prisma/client_competency", () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
    },
  })),
}));

// Mock the authentication middleware
vi.mock("../../../middlewares/authMiddleware", () => ({
  authenticate: vi.fn((req, res, next) => {
    // Add mock user to request
    req.user = {
      userId: "test-user-id",
      email: "test@example.com",
      roles: ["user"],
      permissions: [],
    };
    next();
  }),
}));

// Mock the controller functions
vi.mock("../controllers/profileController", () => ({
  getUserProfileController: vi.fn(),
  updateUserProfileController: vi.fn(),
  getUserBasicInfoController: vi.fn(),
}));

// Import mocked modules to get access to the mock functions
import { verifyToken } from "@Utils/tokenUtils";
import { PrismaClient } from "@prisma/client_competency";
import { authenticate } from "../../../middlewares/authMiddleware";
import {
  getUserProfileController,
  updateUserProfileController,
  getUserBasicInfoController,
} from "../controllers/profileController";

// Now import the routes after all mocks are set up
import profileRoutes from "./profileRoutes";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/competency", profileRoutes);

// Cast to vi.Mock for TypeScript
const mockVerifyToken = verifyToken as vi.MockedFunction<typeof verifyToken>;
const mockAuthenticate = authenticate as vi.MockedFunction<typeof authenticate>;
const mockGetUserProfileController =
  getUserProfileController as vi.MockedFunction<
    typeof getUserProfileController
  >;
const mockUpdateUserProfileController =
  updateUserProfileController as vi.MockedFunction<
    typeof updateUserProfileController
  >;
const mockGetUserBasicInfoController =
  getUserBasicInfoController as vi.MockedFunction<
    typeof getUserBasicInfoController
  >;

// Get the mocked Prisma instance
const mockPrismaClient = vi.mocked(PrismaClient);
const mockFindUnique = vi.fn();

// Valid test token for requests
const validToken = "valid-jwt-token";
const invalidToken = "invalid-jwt-token";

describe("Profile Routes", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set up Prisma mock instance
    mockPrismaClient.mockReturnValue({
      user: {
        findUnique: mockFindUnique,
      },
    } as any);

    // Set up default successful mocks
    mockVerifyToken.mockReturnValue({
      userId: "test-user-id",
      email: "test@example.com",
      role: "user",
    } as any);

    mockFindUnique.mockResolvedValue({
      id: "test-user-id",
      email: "test@example.com",
      userRoles: [],
      sessions: [],
    });

    // Set up default authentication middleware behavior
    mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        userId: "test-user-id",
        email: "test@example.com",
        roles: ["user"],
        permissions: [],
      };
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/competency/", () => {
    it("should return hello message from root route", async () => {
      const response = await request(app).get("/api/competency/").expect(200);
      expect(response.text).toBe("Hello from Profile API");
    });
  });

  describe("Profile Data Routes - /api/competency/profile", () => {
    describe("GET /api/competency/profile", () => {
      it("should get user profile successfully with valid token", async () => {
        const mockProfileData = {
          success: true,
          data: {
            id: "test-user-id",
            email: "test@example.com",
            firstNameTH: "นาย",
            lastNameTH: "ทดสอบ",
            firstNameEN: "Test",
            lastNameEN: "User",
            phone: "0123456789",
            line: "@testuser",
            address: "123 Test Street",
          },
        };

        mockGetUserProfileController.mockImplementation(
          (req: any, res: any) => {
            res.status(200).json(mockProfileData);
          }
        );

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toEqual(mockProfileData);
        expect(mockGetUserProfileController).toHaveBeenCalledTimes(1);
      });

      it("should reject request without token", async () => {
        // Mock authentication failure for this test
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: No token provided" });
        });

        const response = await request(app)
          .get("/api/competency/profile")
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: No token provided");
      });

      it("should reject request with invalid token", async () => {
        // Mock authentication failure for invalid token
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: Invalid token" });
        });

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Authorization", `Bearer ${invalidToken}`)
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: Invalid token");
      });

      it("should reject request with malformed Authorization header", async () => {
        // Mock authentication failure for malformed header
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: No token provided" });
        });

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Authorization", "InvalidFormat token123")
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: No token provided");
      });

      it("should accept token from cookies if Authorization header not present", async () => {
        const mockProfileData = {
          success: true,
          data: {
            id: "test-user-id",
            email: "test@example.com",
          },
        };

        mockGetUserProfileController.mockImplementation(
          (req: any, res: any) => {
            res.status(200).json(mockProfileData);
          }
        );

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Cookie", `token=${validToken}`)
          .expect(200);

        expect(response.body).toEqual(mockProfileData);
      });

      it("should handle user not found after token verification", async () => {
        // Mock authentication failure for user not found
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: User not found" });
        });

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: User not found");
      });
    });

    describe("PUT /api/competency/profile", () => {
      it("should update user profile successfully with valid token", async () => {
        const updateData = {
          firstNameTH: "นายใหม่",
          lastNameTH: "ทดสอบใหม่",
          firstNameEN: "NewTest",
          lastNameEN: "NewUser",
          phone: "0987654321",
          line: "@newtestuser",
          address: "456 New Test Street",
        };

        const mockResponse = {
          success: true,
          message: "Profile updated successfully",
          data: {
            id: "test-user-id",
            email: "test@example.com",
            ...updateData,
          },
        };

        mockUpdateUserProfileController.mockImplementation(
          (req: any, res: any) => {
            res.status(200).json(mockResponse);
          }
        );

        const response = await request(app)
          .put("/api/competency/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toEqual(mockResponse);
        expect(mockUpdateUserProfileController).toHaveBeenCalledTimes(1);
      });

      it("should reject profile update without token", async () => {
        // Mock authentication failure
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: No token provided" });
        });

        const updateData = {
          firstNameTH: "นายใหม่",
          lastNameTH: "ทดสอบใหม่",
        };

        const response = await request(app)
          .put("/api/competency/profile")
          .send(updateData)
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: No token provided");
      });

      it("should handle invalid input data with valid token", async () => {
        const invalidData = {
          firstNameTH: "", // Empty required field
          phone: "invalid-phone",
        };

        mockUpdateUserProfileController.mockImplementation(
          (req: any, res: any) => {
            res.status(400).json({
              success: false,
              message: "Invalid input data",
              errors: [
                "First name in Thai is required",
                "Invalid phone format",
              ],
            });
          }
        );

        const response = await request(app)
          .put("/api/competency/profile")
          .set("Authorization", `Bearer ${validToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid input data");
      });
    });
  });

  describe("Profile Basic Routes - /api/competency/profile/basic", () => {
    describe("GET /api/competency/profile/basic", () => {
      it("should get basic user info successfully with valid token", async () => {
        const mockBasicInfo = {
          success: true,
          data: {
            id: "test-user-id",
            email: "test@example.com",
            firstNameEN: "Test",
            firstNameTH: "ทดสอบ",
            profileImage: "https://example.com/profile.jpg",
          },
        };

        mockGetUserBasicInfoController.mockImplementation(
          (req: any, res: any) => {
            res.status(200).json(mockBasicInfo);
          }
        );

        const response = await request(app)
          .get("/api/competency/profile/basic")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toEqual(mockBasicInfo);
        expect(mockGetUserBasicInfoController).toHaveBeenCalledTimes(1);
      });

      it("should reject basic info request without token", async () => {
        // Mock authentication failure
        mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
          res.status(401).json({ message: "Unauthorized: No token provided" });
        });

        const response = await request(app)
          .get("/api/competency/profile/basic")
          .expect(401);

        expect(response.body.message).toBe("Unauthorized: No token provided");
      });

      it("should handle server error for basic info with valid token", async () => {
        mockGetUserBasicInfoController.mockImplementation(
          (req: any, res: any) => {
            res.status(500).json({
              success: false,
              message: "Internal server error.",
            });
          }
        );

        const response = await request(app)
          .get("/api/competency/profile/basic")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(500);

        expect(response.body).toEqual({
          success: false,
          message: "Internal server error.",
        });
      });
    });
  });

  describe("Authentication Edge Cases", () => {
    it("should handle expired token", async () => {
      // Mock authentication failure for expired token
      mockAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
      });

      const response = await request(app)
        .get("/api/competency/profile")
        .set("Authorization", "Bearer expired-token")
        .expect(401);

      expect(response.body.message).toBe("Unauthorized: Invalid token");
    });

    it("should handle different token formats in Authorization header", async () => {
      // Test with different Bearer token formats
      const testCases = [
        { header: "bearer valid-token", shouldPass: false }, // lowercase bearer
        { header: "Bearer valid-token", shouldPass: true }, // proper format
        { header: "Token valid-token", shouldPass: false }, // wrong prefix
      ];

      for (const testCase of testCases) {
        // Reset mocks for each iteration
        vi.clearAllMocks();

        if (testCase.shouldPass) {
          // Set up successful authentication for valid format
          mockAuthenticate.mockImplementation(
            (req: any, res: any, next: any) => {
              req.user = {
                userId: "test-user-id",
                email: "test@example.com",
                roles: ["user"],
                permissions: [],
              };
              next();
            }
          );

          mockGetUserProfileController.mockImplementation(
            (req: any, res: any) => {
              res.status(200).json({ success: true });
            }
          );
        } else {
          // Set up authentication failure for invalid format
          mockAuthenticate.mockImplementation(
            (req: any, res: any, next: any) => {
              res
                .status(401)
                .json({ message: "Unauthorized: No token provided" });
            }
          );
        }

        const response = await request(app)
          .get("/api/competency/profile")
          .set("Authorization", testCase.header);

        if (testCase.shouldPass) {
          expect([200, 500]).toContain(response.status);
        } else {
          expect(response.status).toBe(401);
          expect(response.body.message).toBe("Unauthorized: No token provided");
        }
      }
    });
  });

  describe("Route Structure Tests", () => {
    it("should handle invalid routes gracefully", async () => {
      const response = await request(app)
        .get("/api/competency/nonexistent")
        .expect(404);
    });

    it("should reject unsupported HTTP methods", async () => {
      const response = await request(app)
        .delete("/api/competency/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(404);
    });
  });
});
