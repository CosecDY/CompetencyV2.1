import api from "@Services/api";

/**
 * Interface for the response from the backup initiation endpoint.
 */
export interface BackupInitiationResponse {
  message: string;
  backupFiles: string[];
}

/**
 * Interface for the response containing available databases.
 */
export interface AvailableDatabasesResponse {
  databases: string[];
}

export const BackupService = {
  /**
   * Fetches the list of all available databases from the backend.
   * This is used to populate the checkboxes on the frontend.
   * @returns A promise that resolves with an object containing an array of database names.
   */
  getAvailableDatabases: async (): Promise<AvailableDatabasesResponse> => {
    try {
      const { data } = await api.get<AvailableDatabasesResponse>("/admin/backup/databases");
      return data;
    } catch (error) {
      console.error("Failed to fetch available databases:", error);
      throw error;
    }
  },

  /**
   * Triggers the database backup process on the backend for selected databases.
   * This method sends a POST request with the list of databases to back up.
   * @param databases An array of database names to be backed up.
   * @returns A promise that resolves with an object containing the backup filenames.
   */
  initiateBackup: async (databases: string[]): Promise<BackupInitiationResponse> => {
    try {
      // Switched to a POST request to send the selected databases in the body
      const { data } = await api.post<BackupInitiationResponse>("/admin/backup", { databases });
      return data;
    } catch (error) {
      console.error("Failed to initiate backup:", error);
      throw error;
    }
  },

  /**
   * Initiates the download of a specific backup file.
   * This method uses the browser's native `window.open()` to trigger a file download.
   * @param filename The name of the file to download.
   */
  downloadBackup: (filename: string): void => {
    try {
      const downloadUrl = `${api.defaults.baseURL}/admin/backup/${filename}`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to download file:", error);
      throw error;
    }
  },
};
