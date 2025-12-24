import React, { useState } from "react";
import { AdminLayout } from "@Layouts/AdminLayout";
import { Card, Button } from "@Components/Admin/ExportComponent";
import { BiRefresh, BiDownload, BiShieldQuarter } from "react-icons/bi";
import { FaCheckCircle, FaDatabase } from "react-icons/fa";
import { useAdvancedBackup } from "modules/admin/blackup/hooks/useBackup";
import { BackupService } from "modules/admin/system/Backup/services/BackupService";

export const BackupPage: React.FC = () => {
  const { initiateBackup, backupData, isLoading, availableDatabases, isFetchingDatabases } = useAdvancedBackup();
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-maintext flex items-center gap-2">
              <BiShieldQuarter className="text-brand" /> Database Backup
            </h1>
            <p className="text-muted mt-1">Manage system snapshots and recovery files.</p>
          </div>

          <Button
            onClick={handleBackupAll}
            variant="primary"
            isLoading={isLoading && currentBackupDb === "all"}
            disabled={isFetchingDatabases || availableDatabases.length === 0}
            leftIcon={<BiRefresh />}
            className="shadow-brand/20 shadow-lg"
          >
            Backup All Databases
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 border-none shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
                <h2 className="font-bold text-maintext flex items-center gap-2">
                  <FaDatabase className="text-brand/70 text-sm" /> Available Databases
                </h2>
                <span className="text-xs font-bold px-2 py-1 bg-brand/10 text-brand rounded-full">{availableDatabases.length} Connected</span>
              </div>

              <div className="p-6">
                {isFetchingDatabases ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-background animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableDatabases.map((dbName) => (
                      <div key={dbName} className="group p-4 rounded-xl border border-border bg-background hover:bg-surface hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface rounded-lg text-brand shadow-sm">
                            <FaDatabase />
                          </div>
                          <span className="font-bold text-maintext">{dbName}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCardClick(dbName)}
                          isLoading={isLoading && currentBackupDb === dbName}
                          disabled={isLoading && currentBackupDb !== dbName}
                        >
                          Backup
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-0 border-none shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border bg-surface">
                <h2 className="font-bold text-maintext">Backup Activity</h2>
              </div>
              <div className="p-6">
                {isLoading && currentBackupDb !== "all" && (
                  <div className="flex flex-col items-center py-8">
                    <BiRefresh className="animate-spin text-4xl text-brand" />
                    <p className="mt-4 text-muted animate-pulse">Processing backup for {currentBackupDb}...</p>
                  </div>
                )}

                {backupData ? (
                  <div className="space-y-4">
                    {backupData.map((result, idx) => (
                      <div key={idx} className="bg-green-50/50 border border-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                          <FaCheckCircle /> {result.message}
                        </div>
                        <div className="space-y-2">
                          {result.backupFiles.map((file, fIdx) => (
                            <div key={fIdx} className="flex items-center justify-between bg-surface p-3 rounded-lg border border-green-100 shadow-sm">
                              <span className="font-mono text-xs text-muted truncate max-w-[250px] md:max-w-md">{file}</span>
                              <Button size="sm" variant="outline" leftIcon={<BiDownload />} onClick={() => handleDownload(file)} className="text-xs">
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoading && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                        <BiDownload className="text-muted text-2xl" />
                      </div>
                      <p className="text-muted text-sm">No recent backup activity. Select a database to begin.</p>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>

          {/* <div className="space-y-6">
            <Card className="p-6 border-none shadow-soft bg-surface">
              <h3 className="font-bold text-maintext mb-4">Backup Policy</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-muted leading-relaxed">Automated snapshots are taken every 24 hours at 02:00 AM.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-muted leading-relaxed">Backups are stored for a maximum of 30 days before rotation.</p>
                </div>
                <div className="p-4 bg-brand/5 rounded-xl border border-brand/10 mt-2">
                  <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-1">Last System Backup</p>
                  <p className="text-sm font-bold text-maintext">2 hours ago</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-soft bg-surface">
              <h3 className="font-bold text-maintext mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors text-sm text-muted font-medium">
                  View Logs <BiChevronRight />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors text-sm text-muted font-medium">
                  Storage Settings <BiChevronRight />
                </button>
              </div>
            </Card>
          </div> */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BackupPage;
