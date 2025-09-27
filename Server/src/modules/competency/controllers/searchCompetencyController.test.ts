import { Request, Response } from "express";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import * as searchCompetencyController from "./searchCompetencyController";
import * as searchCompetencyServices from "@Competency/services/searchCompetencyServices";

// Mock the services
vi.mock("@Competency/services/searchCompetencyServices", () => ({
  getCompetencies: vi.fn(),
  searchCompetency: vi.fn(),
}));

describe("Search Competency Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock request and response
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCompetencies", () => {
    it("should return competencies for valid SFIA database", async () => {
      // Arrange
      const mockCompetencies = ["Software Engineer", "Data Scientist"];
      mockRequest.params = { dbType: "sfia" };
      (searchCompetencyServices.getCompetencies as any).mockResolvedValue(
        mockCompetencies
      );

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.getCompetencies).toHaveBeenCalledWith(
        "sfia"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({ Competencies: mockCompetencies });
    });

    it("should return competencies for valid TPQI database", async () => {
      // Arrange
      const mockCompetencies = ["Security Analyst", "Network Admin"];
      mockRequest.params = { dbType: "tpqi" };
      (searchCompetencyServices.getCompetencies as any).mockResolvedValue(
        mockCompetencies
      );

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.getCompetencies).toHaveBeenCalledWith(
        "tpqi"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({ Competencies: mockCompetencies });
    });

    it("should return 400 for invalid dbType", async () => {
      // Arrange
      mockRequest.params = { dbType: "invalid" };

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.getCompetencies).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Invalid or missing dbType (must be 'sfia' or 'tpqi')",
        errorType: "validation",
        details: { validTypes: ["sfia", "tpqi"] },
      });
    });

    it("should return 400 for missing dbType", async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Invalid or missing dbType (must be 'sfia' or 'tpqi')",
        errorType: "validation",
        details: { validTypes: ["sfia", "tpqi"] },
      });
    });

    it("should handle database connection errors", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      const dbError = new Error("Connection refused") as any;
      dbError.code = "ECONNREFUSED";
      (searchCompetencyServices.getCompetencies as any).mockRejectedValue(
        dbError
      );

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.SERVICE_UNAVAILABLE);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Database connection failed",
        errorType: "database_connection",
        details: null,
      });
    });

    it("should handle database query errors", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      const dbError = { code: "P2002", name: "PrismaClientKnownRequestError" };
      (searchCompetencyServices.getCompetencies as any).mockRejectedValue(
        dbError
      );

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Database query failed",
        errorType: "database_query",
        details: { code: "P2002" },
      });
    });

    it("should handle timeout errors", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      const timeoutError = new Error("Request timeout") as any;
      timeoutError.code = "ETIMEDOUT";
      (searchCompetencyServices.getCompetencies as any).mockRejectedValue(
        timeoutError
      );

      // Act
      await searchCompetencyController.getCompetencies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.REQUEST_TIMEOUT);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Request timeout",
        errorType: "timeout",
        details: null,
      });
    });
  });

  describe("searchCompetency", () => {
    it("should return search results for valid request", async () => {
      // Arrange
      const mockResults = ["Software Engineer", "Software Architect"];
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: "software" };
      (searchCompetencyServices.searchCompetency as any).mockResolvedValue(
        mockResults
      );

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.searchCompetency).toHaveBeenCalledWith(
        "sfia",
        "software"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({ results: mockResults });
    });

    it("should handle search term with whitespace", async () => {
      // Arrange
      const mockResults = ["Data Scientist"];
      mockRequest.params = { dbType: "tpqi" };
      mockRequest.body = { searchTerm: "  data  " };
      (searchCompetencyServices.searchCompetency as any).mockResolvedValue(
        mockResults
      );

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.searchCompetency).toHaveBeenCalledWith(
        "tpqi",
        "data"
      );
    });

    it("should return 400 for invalid dbType", async () => {
      // Arrange
      mockRequest.params = { dbType: "invalid" };
      mockRequest.body = { searchTerm: "software" };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(searchCompetencyServices.searchCompetency).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Invalid or missing dbType (must be 'sfia' or 'tpqi')",
        errorType: "validation",
        details: { validTypes: ["sfia", "tpqi"] },
      });
    });

    it("should return 400 for missing searchTerm", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = {};

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Missing or invalid searchTerm",
        errorType: "validation",
        details: { expected: "non-empty string" },
      });
    });

    it("should return 400 for empty searchTerm", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: "" };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Missing or invalid searchTerm",
        errorType: "validation",
        details: { expected: "non-empty string" },
      });
    });

    it("should return 400 for searchTerm with only whitespace", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: "   " };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Missing or invalid searchTerm",
        errorType: "validation",
        details: { expected: "non-empty string" },
      });
    });

    it("should return 400 for searchTerm shorter than 2 characters", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: "a" };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Search term must be at least 2 characters long",
        errorType: "validation",
        details: { minLength: 2, provided: 1 },
      });
    });

    it("should return 400 for searchTerm longer than 100 characters", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      const longSearchTerm = "a".repeat(101);
      mockRequest.body = { searchTerm: longSearchTerm };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Search term is too long (maximum 100 characters)",
        errorType: "validation",
        details: { maxLength: 100, provided: 101 },
      });
    });

    it("should return 400 for non-string searchTerm", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: 123 };

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Missing or invalid searchTerm",
        errorType: "validation",
        details: { expected: "non-empty string" },
      });
    });

    it("should handle service errors", async () => {
      // Arrange
      mockRequest.params = { dbType: "sfia" };
      mockRequest.body = { searchTerm: "software" };
      const serviceError = new Error("Service error");
      (searchCompetencyServices.searchCompetency as any).mockRejectedValue(
        serviceError
      );

      // Act
      await searchCompetencyController.searchCompetency(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(statusMock).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Service error",
        errorType: "unknown",
        details: null,
      });
    });
  });
});
