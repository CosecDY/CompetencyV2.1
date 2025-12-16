import { useState, useEffect } from "react";
import { BackupService, BackupInitiationResponse } from "modules/admin/system/Backup/services/BackupService";

const globalState = {
  isLoading: false,
  error: null as string | null,
  backupData: [] as BackupInitiationResponse[],
  isFetchingDatabases: true,
  availableDatabases: [] as string[],
};

let onStateChangeCallback: (() => void) | null = null;

const notifyStateChange = () => {
  if (onStateChangeCallback) {
    onStateChangeCallback();
  }
};

export const backupProcess = async (databases: string[]) => {
  globalState.isLoading = true;
  globalState.error = null;
  globalState.backupData = [];
  notifyStateChange();

  try {
    const response = await BackupService.initiateBackup(databases);
    globalState.backupData.push(response);
  } catch (error) {
    console.error("Backup failed:", error);
    globalState.error = "Failed to initiate backup. Please check the server logs.";
  } finally {
    globalState.isLoading = false;
    notifyStateChange();
  }
};

export const useAdvancedBackup = () => {
  const [state, setState] = useState({ ...globalState });

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const data = await BackupService.getAvailableDatabases();
        globalState.availableDatabases = data.databases;
      } catch (error) {
        console.log(error);

        globalState.error = "Failed to fetch available databases.";
      } finally {
        globalState.isFetchingDatabases = false;
        notifyStateChange();
      }
    };
    fetchDatabases();

    onStateChangeCallback = () => {
      setState({ ...globalState });
    };

    return () => {
      onStateChangeCallback = null;
    };
  }, []);

  return {
    initiateBackup: backupProcess,
    backupData: state.backupData,
    isLoading: state.isLoading,
    error: state.error,
    availableDatabases: state.availableDatabases,
    isFetchingDatabases: state.isFetchingDatabases,
  };
};
