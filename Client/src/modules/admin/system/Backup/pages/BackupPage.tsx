import React, { useState } from "react";
import { AdminLayout } from "@Layouts/AdminLayout";
import { BiRefresh, BiDownload } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { useAdvancedBackup } from "modules/admin/blackup/hooks/useBackup";
import { BackupService } from "modules/admin/system/Backup/services/BackupService";
import "react-loading-skeleton/dist/skeleton.css";

export const BackupPage: React.FC = () => {
  const { initiateBackup, backupData, isLoading, error, availableDatabases, isFetchingDatabases } = useAdvancedBackup();

  const [currentBackupDb, setCurrentBackupDb] = useState<string | null>(null);

  const handleDownload = (filename: string) => {
    BackupService.downloadBackup(filename);
  };

  const handleCardClick = async (dbName: string) => {
    setCurrentBackupDb(dbName);
    await initiateBackup([dbName]);
    setCurrentBackupDb(null);
  };

  const handleBackupAll = async () => {
    if (availableDatabases.length === 0) return;
    setCurrentBackupDb("all");
    await initiateBackup(availableDatabases);
    setCurrentBackupDb(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Database Backup</h1>
            <p className="text-gray-500">Back up individual databases or download existing files.</p>
          </div>

          <div>
            <button
              onClick={handleBackupAll}
              disabled={isLoading || isFetchingDatabases || availableDatabases.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${isLoading || isFetchingDatabases || availableDatabases.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
              `}
            >
              {isLoading ? (
                <>
                  <BiRefresh className="animate-spin text-xl" />
                  Backing Up All...
                </>
              ) : (
                <>
                  <BiRefresh className="text-xl" />
                  Backup All
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Databases</h2>
          {isFetchingDatabases ? (
            <div className="text-center text-gray-400 py-4">
              <p>Loading available databases...</p>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableDatabases.map((dbName) => (
                <div key={dbName} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-lg">
                  <p className="text-xl font-semibold text-gray-800 mb-2">{dbName}</p>
                  <button
                    onClick={() => handleCardClick(dbName)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                      ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
                    `}
                  >
                    {isLoading && currentBackupDb === dbName ? (
                      <>
                        <BiRefresh className="animate-spin text-xl" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <BiRefresh className="text-xl" />
                        Create Backup
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {error && !isFetchingDatabases && (
            <div className="text-red-500 text-center py-4">
              <p>Error: {error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <BiRefresh className="animate-spin text-5xl text-blue-500" />
              <p className="mt-4 text-gray-600">Please wait, the backup process for "{currentBackupDb}" may take a few moments...</p>
            </div>
          )}

          {backupData && (
            <div className="space-y-4">
              {backupData.map((backupResult, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <FaCheckCircle className="text-2xl" /> <p>{backupResult.message}</p>
                  </div>

                  <ul className="space-y-2 mt-2">
                    {backupResult.backupFiles.map((filename, fileIndex) => (
                      <li key={fileIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p className="font-mono text-sm text-gray-700">{filename}</p>
                        <button onClick={() => handleDownload(filename)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                          <BiDownload className="text-lg" /> Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !backupData && !error && !isFetchingDatabases && (
            <div className="text-center text-gray-400 py-10">
              <p>Click on a database card to create a backup or "Backup All" to back up all databases.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BackupPage;
