export interface Session {
  id: string;
  userId: string;
  email: string;
  expiresAt?: string | null;
  status: "online" | "offline";
}

export interface SessionPageResult {
  data: Session[];
  total: number;
}
