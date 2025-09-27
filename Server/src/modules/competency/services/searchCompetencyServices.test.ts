import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as searchCompetencyServices from "./searchCompetencyServices";
import { prismaSfia, prismaTpqi } from "@Database/prismaClients";

// Mock the Prisma clients
vi.mock("@Database/prismaClients", () => ({
  prismaSfia: {
    skill: {
      findMany: vi.fn(),
    },
  },
  prismaTpqi: {
    unitCode: {
      findMany: vi.fn(),
    },
  },
}));

describe("Search Competency Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCompetencies", () => {
    it("should return all SFIA competencies with names and IDs", async () => {
      // Arrange
      const mockSfiaData = [
        { name: "Software Engineer", code: "SWENG" },
        { name: "Data Scientist", code: "DATAS" },
        { name: "DevOps Engineer", code: "DEVOP" },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockSfiaData);

      // Act
      const result = await searchCompetencyServices.getCompetencies("sfia");

      // Assert
      expect(prismaSfia.skill.findMany).toHaveBeenCalledWith({
        select: {
          name: true,
          code: true,
        },
        orderBy: { name: "asc" },
        take: 100,
        distinct: ["name"],
      });

      expect(result).toEqual([
        { name: "Software Engineer", id: "SWENG" },
        { name: "Data Scientist", id: "DATAS" },
        { name: "DevOps Engineer", id: "DEVOP" },
      ]);
    });

    it("should return all TPQI competencies with names and IDs", async () => {
      // Arrange
      const mockTpqiData = [
        { name: "Security Analyst", code: "SEC001" },
        { name: "Network Administrator", code: "NET001" },
      ];
      (prismaTpqi.unitCode.findMany as any).mockResolvedValue(mockTpqiData);

      // Act
      const result = await searchCompetencyServices.getCompetencies("tpqi");

      // Assert
      expect(prismaTpqi.unitCode.findMany).toHaveBeenCalledWith({
        select: {
          name: true,
          code: true,
        },
        orderBy: { name: "asc" },
        take: 100,
        distinct: ["name"],
      });

      expect(result).toEqual([
        { name: "Security Analyst", id: "SEC001" },
        { name: "Network Administrator", id: "NET001" },
      ]);
    });

    it("should handle numeric IDs by converting them to strings", async () => {
      // Arrange
      const mockDataWithNumericIds = [
        { name: "Test Competency", code: 12345 },
        { name: "Another Competency", code: 67890 },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockDataWithNumericIds);

      // Act
      const result = await searchCompetencyServices.getCompetencies("sfia");

      // Assert
      expect(result).toEqual([
        { name: "Test Competency", id: "12345" },
        { name: "Another Competency", id: "67890" },
      ]);
    });

    it("should handle empty result from database", async () => {
      // Arrange
      (prismaSfia.skill.findMany as any).mockResolvedValue([]);

      // Act
      const result = await searchCompetencyServices.getCompetencies("sfia");

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      (prismaSfia.skill.findMany as any).mockRejectedValue(dbError);

      // Act & Assert
      await expect(searchCompetencyServices.getCompetencies("sfia")).rejects.toThrow(
        "Database connection failed"
      );
      expect(prismaSfia.skill.findMany).toHaveBeenCalledTimes(1);
    });

    it("should use correct database configuration for each dbType", async () => {
      // Test SFIA configuration
      (prismaSfia.skill.findMany as any).mockResolvedValue([]);
      await searchCompetencyServices.getCompetencies("sfia");
      expect(prismaSfia.skill.findMany).toHaveBeenCalled();

      // Test TPQI configuration
      (prismaTpqi.unitCode.findMany as any).mockResolvedValue([]);
      await searchCompetencyServices.getCompetencies("tpqi");
      expect(prismaTpqi.unitCode.findMany).toHaveBeenCalled();
    });
  });

  describe("searchCompetency", () => {
    it("should return search results for SFIA database", async () => {
      // Arrange
      const mockSearchResults = [
        { name: "Software Engineer", code: "SWENG" },
        { name: "Software Architect", code: "SWARCH" },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockSearchResults);

      // Act
      const result = await searchCompetencyServices.searchCompetency("sfia", "software");

      // Assert
      expect(prismaSfia.skill.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: "software",
          },
        },
        select: {
          name: true,
          code: true,
        },
        orderBy: { name: "asc" },
        take: 100,
        distinct: ["name"],
      });

      expect(result).toEqual([
        { name: "Software Engineer", id: "SWENG" },
        { name: "Software Architect", id: "SWARCH" },
      ]);
    });

    it("should return search results for TPQI database", async () => {
      // Arrange
      const mockSearchResults = [
        { name: "Security Analyst", code: "SEC001" },
        { name: "Cybersecurity Engineer", code: "SEC002" },
      ];
      (prismaTpqi.unitCode.findMany as any).mockResolvedValue(mockSearchResults);

      // Act
      const result = await searchCompetencyServices.searchCompetency("tpqi", "security");

      // Assert
      expect(prismaTpqi.unitCode.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: "security",
          },
        },
        select: {
          name: true,
          code: true,
        },
        orderBy: { name: "asc" },
        take: 100,
        distinct: ["name"],
      });

      expect(result).toEqual([
        { name: "Security Analyst", id: "SEC001" },
        { name: "Cybersecurity Engineer", id: "SEC002" },
      ]);
    });

    it("should normalize search term to lowercase and trim whitespace", async () => {
      // Arrange
      const mockSearchResults = [{ name: "Data Scientist", code: "DATA001" }];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockSearchResults);

      // Act
      await searchCompetencyServices.searchCompetency("sfia", "  DATA  ");

      // Assert
      expect(prismaSfia.skill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              contains: "data",
            },
          },
        })
      );
    });

    it("should return empty array for empty search term", async () => {
      // Act
      const result1 = await searchCompetencyServices.searchCompetency("sfia", "");
      const result2 = await searchCompetencyServices.searchCompetency("sfia", "   ");

      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(prismaSfia.skill.findMany).not.toHaveBeenCalled();
    });

    it("should handle duplicates by deduplicating results", async () => {
      // Arrange - Mock data with duplicates
      const mockDataWithDuplicates = [
        { name: "Software Engineer", code: "SWENG1" },
        { name: "Software Engineer", code: "SWENG2" }, // Duplicate name
        { name: "Data Scientist", code: "DATA001" },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockDataWithDuplicates);

      // Act
      const result = await searchCompetencyServices.searchCompetency("sfia", "software");

      // Assert - Should only return unique names (first occurrence)
      expect(result).toEqual([
        { name: "Software Engineer", id: "SWENG1" },
        { name: "Data Scientist", id: "DATA001" },
      ]);
    });

    it("should filter out invalid data entries", async () => {
      // Arrange - Mock data with invalid entries
      const mockDataWithInvalid = [
        { name: "Software Engineer", code: "SWENG" }, // Valid
        { name: "", code: "EMPTY" }, // Invalid - empty name
        { name: null, code: "NULL" }, // Invalid - null name
        { name: "Data Scientist", code: null }, // Invalid - null code
        { name: "DevOps Engineer", code: "DEVOPS" }, // Valid
        null, // Invalid - null item
        { name: "Network Admin", code: undefined }, // Invalid - undefined code
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockDataWithInvalid);

      // Act
      const result = await searchCompetencyServices.searchCompetency("sfia", "engineer");

      // Assert - Should only return valid entries
      expect(result).toEqual([
        { name: "Software Engineer", id: "SWENG" },
        { name: "DevOps Engineer", id: "DEVOPS" },
      ]);
    });

    it("should convert numeric IDs to strings in search results", async () => {
      // Arrange
      const mockDataWithNumericIds = [
        { name: "Test Engineer", code: 12345 },
        { name: "Senior Engineer", code: 67890 },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockDataWithNumericIds);

      // Act
      const result = await searchCompetencyServices.searchCompetency("sfia", "engineer");

      // Assert
      expect(result).toEqual([
        { name: "Test Engineer", id: "12345" },
        { name: "Senior Engineer", id: "67890" },
      ]);
    });

    it("should return empty array when no matches found", async () => {
      // Arrange
      (prismaSfia.skill.findMany as any).mockResolvedValue([]);

      // Act
      const result = await searchCompetencyServices.searchCompetency("sfia", "nonexistent");

      // Assert
      expect(result).toEqual([]);
      expect(prismaSfia.skill.findMany).toHaveBeenCalledTimes(1);
    });

    it("should throw error when database query fails", async () => {
      // Arrange
      const dbError = new Error("Database query failed");
      (prismaSfia.skill.findMany as any).mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        searchCompetencyServices.searchCompetency("sfia", "software")
      ).rejects.toThrow("Database query failed");
    });

    it("should handle case-insensitive search correctly", async () => {
      // Arrange
      const mockSearchResults = [
        { name: "Software Engineer", code: "SWENG" },
        { name: "software architect", code: "SWARCH" },
      ];
      (prismaSfia.skill.findMany as any).mockResolvedValue(mockSearchResults);

      // Act - Test with different cases
      const result1 = await searchCompetencyServices.searchCompetency("sfia", "SOFTWARE");
      const result2 = await searchCompetencyServices.searchCompetency("sfia", "Software");
      const result3 = await searchCompetencyServices.searchCompetency("sfia", "software");

      // Assert - All should use lowercase in the query
      expect(prismaSfia.skill.findMany).toHaveBeenCalledTimes(3);
      
      // Check that all calls used lowercase search term
      const calls = (prismaSfia.skill.findMany as any).mock.calls;
      expect(calls[0][0].where.name.contains).toBe("software");
      expect(calls[1][0].where.name.contains).toBe("software");
      expect(calls[2][0].where.name.contains).toBe("software");
    });
  });

  describe("Database Configuration", () => {
    it("should use correct table and field names for SFIA", async () => {
      // Arrange
      (prismaSfia.skill.findMany as any).mockResolvedValue([]);

      // Act
      await searchCompetencyServices.getCompetencies("sfia");

      // Assert
      expect(prismaSfia.skill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            name: true,
            code: true,
          },
        })
      );
    });

    it("should use correct table and field names for TPQI", async () => {
      // Arrange
      (prismaTpqi.unitCode.findMany as any).mockResolvedValue([]);

      // Act
      await searchCompetencyServices.getCompetencies("tpqi");

      // Assert
      expect(prismaTpqi.unitCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            name: true,
            code: true,
          },
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should log errors with appropriate context for getCompetencies", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const dbError = new Error("Connection failed");
      (prismaSfia.skill.findMany as any).mockRejectedValue(dbError);

      // Act & Assert
      await expect(searchCompetencyServices.getCompetencies("sfia")).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching SFIA skill names:",
        dbError
      );

      consoleSpy.mockRestore();
    });

    it("should log errors with appropriate context for searchCompetency", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const dbError = new Error("Query failed");
      (prismaTpqi.unitCode.findMany as any).mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        searchCompetencyServices.searchCompetency("tpqi", "test")
      ).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error searching TPQI career names:",
        dbError
      );

      consoleSpy.mockRestore();
    });
  });
});