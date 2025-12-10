import api from "@Services/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: string;
}

export interface GoogleLoginResponse {
  csrfToken: string;
  user: User;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  csrfToken: string;
}

export interface CurrentUserResponse {
  user: User;
  expiresIn: number;
  csrfToken: string;
  permissions?: string[];
}
export interface CheckViewResponse {
  allowed: boolean;
  message?: string;
}

// Login with Google
export async function loginWithGoogle(idToken: string): Promise<GoogleLoginResponse> {
  if (!idToken || !/^ey/.test(idToken)) {
    throw new Error("Invalid or missing Google ID token");
  }

  const response = await api.post<GoogleLoginResponse>("/competency/auth/google", { idToken }, { withCredentials: true });

  return response.data;
}

// Logout
export async function logout(): Promise<void> {
  await api.post("/competency/auth/logout", {}, { withCredentials: true });
}

// Refresh access token
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const response = await api.post<RefreshTokenResponse>("/competency/auth/refresh-token", {}, { withCredentials: true });
  return response.data;
}

// Get current authenticated user
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>("/competency/auth/me", {
    withCredentials: true,
  });
  return response.data;
}

export async function checkViewPermission(resource: string): Promise<CheckViewResponse> {
  if (!resource) throw new Error("Resource is required");

  const response = await api.get<CheckViewResponse>("/competency/auth/check-view", {
    params: { resource },
    withCredentials: true,
  });

  return response.data;
}
