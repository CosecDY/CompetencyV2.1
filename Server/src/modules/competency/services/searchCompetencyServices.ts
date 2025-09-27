import { prismaSfia, prismaTpqi } from "@Database/prismaClients";

type DBType = "sfia" | "tpqi";

interface DatabaseConfig {
  client: typeof prismaSfia | typeof prismaTpqi;
  table: string;
  field: string;
  idField: string; // Added ID field
  errorPrefix: string;
}

// Configuration mapping for database types
const DB_CONFIG: Record<DBType, DatabaseConfig> = {
  sfia: {
    client: prismaSfia,
    table: "skill",
    field: "name",
    idField: "code", // ID field for SFIA
    errorPrefix: "SFIA skill names",
  },
  tpqi: {
    client: prismaTpqi,
    table: "unitCode",
    field: "name",
    idField: "code", // ID field for TPQI
    errorPrefix: "TPQI career names",
  },
};

/**
 * Generic function to execute database queries with error handling
 */
async function executeQuery<T>(
  operation: string,
  dbType: DBType,
  queryFn: (config: DatabaseConfig) => Promise<T>
): Promise<T> {
  const config = DB_CONFIG[dbType];
  try {
    return await queryFn(config);
  } catch (error) {
    console.error(`Error ${operation} ${config.errorPrefix}:`, error);
    throw error;
  }
}

/**
 * Get all skill/career names from the specified database and their IDs
 */
export async function getCompetencies(
  dbType: DBType
): Promise<Array<{ name: string; id: string }>> {
  return executeQuery("fetching", dbType, async (config) => {
    const results = await (config.client as any)[config.table].findMany({
      select: {
        [config.field]: true,
        [config.idField]: true,
      },
      orderBy: { [config.field]: "asc" },
      take: 100,
      distinct: [config.field], // Remove duplicates based on name field
    });
    return results.map((item: any) => ({
      name: item[config.field],
      id: String(item[config.idField]), // Convert Int ID to string
    }));
  });
}

/**
 * Search for skill/career names containing the search term and return both name and ID
 */
export async function searchCompetency(
  dbType: DBType,
  searchTerm: string
): Promise<Array<{ name: string; id: string }>> {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  if (!normalizedSearchTerm) {
    return [];
  }
  return executeQuery("searching", dbType, async (config) => {
    const results = await (config.client as any)[config.table].findMany({
      where: {
        [config.field]: {
          contains: normalizedSearchTerm,
        },
      },
      select: {
        [config.field]: true,
        [config.idField]: true,
      },
      orderBy: { [config.field]: "asc" },
      take: 100,
      distinct: [config.field], // Remove duplicates based on name field
    });

    // Additional client-side deduplication for extra safety
    const uniqueResults = new Map<string, { name: string; id: string }>();

    results
      .filter(
        (item: any) =>
          item && // Ensure item exists
          typeof item[config.field] === "string" &&
          item[config.field].length > 0 &&
          item[config.idField] != null // Check for both null and undefined
      )
      .forEach((item: any) => {
        const name = item[config.field];
        if (!uniqueResults.has(name)) {
          uniqueResults.set(name, {
            name: name,
            id: String(item[config.idField]),
          });
        }
      });

    return Array.from(uniqueResults.values());
  });
}
