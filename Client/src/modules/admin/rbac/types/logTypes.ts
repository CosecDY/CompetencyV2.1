// --- Log ---
export enum LogAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

export interface Log {
  id: number;
  action: LogAction;
  databaseName: string;
  tableName: string;
  recordId?: string;
  userId?: string;
  timestamp?: string;
  parameters?: string;
}

export interface LogPageResult {
  data: Log[];
  total: number;
}
