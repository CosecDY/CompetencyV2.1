import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AuthService from "@Competency/services/authServices";
import { AuthenticatedRequest } from "@Middlewares/authMiddleware";
import { PermissionService } from "@Competency/services/checkPermission";

const isProduction = process.env.NODE_ENV === "production";

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? Number(value) : defaultValue;
};

const ACCESS_TOKEN_EXPIRATION = getEnvNumber("JWT_ACCESS_EXPIRATION", 3600); // 1 hr
const REFRESH_TOKEN_MAX_AGE = getEnvNumber("JWT_REFRESH_EXPIRATION", 604800); // 7 days

// Base Cookie Options
const BASE_COOKIE_OPTIONS = {
  secure: isProduction,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  path: "/",
};

// [SECURITY] Access Token ต้อง httpOnly: true เสมอ (JS อ่านไม่ได้)
const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  httpOnly: true,
  maxAge: ACCESS_TOKEN_EXPIRATION * 1000,
};

// [SECURITY] Refresh Token ต้อง httpOnly: true เสมอ
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  httpOnly: true,
  maxAge: REFRESH_TOKEN_MAX_AGE * 1000,
};

// [IMPORTANT] CSRF Token ต้อง httpOnly: false เสมอ เพื่อให้ Frontend (JS) อ่านค่าส่งกลับมาใน Header ได้
const CSRF_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  httpOnly: false,
  maxAge: ACCESS_TOKEN_EXPIRATION * 1000,
};

// Login with Google
export const loginWithGoogle = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "ID token is required" });
  }

  try {
    const { user, accessToken, refreshToken, csrfToken } = await AuthService.loginWithGoogle(idToken);

    // Clear old cookies first
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("csrfToken", { path: "/" });

    // Set new cookies
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("csrfToken", csrfToken, CSRF_COOKIE_OPTIONS);

    res.status(StatusCodes.OK).json({
      user,
      csrfToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
      provider: "google",
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message || "Google login failed" });
  }
};

// Logout
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  // Clear Cookies regardless of server status
  res.clearCookie("refreshToken", { path: "/" });
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });

  if (!refreshToken) return res.sendStatus(StatusCodes.NO_CONTENT);

  try {
    await AuthService.logout(refreshToken);
    res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
  } catch (err: any) {
    console.error("Logout error:", err);
    res.status(StatusCodes.OK).json({ message: "Logged out locally" });
  }
};

// Refresh token
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Refresh token is required" });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken, csrfToken } = await AuthService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("csrfToken", csrfToken, CSRF_COOKIE_OPTIONS);

    res.status(StatusCodes.OK).json({
      csrfToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  } catch (err) {
    console.error("[refreshAccessToken] Refresh failed:", err);
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("csrfToken", { path: "/" });
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Refresh token expired or invalid" });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No authenticated user" });
    }

    const serviceResult = await AuthService.getCurrentUser(String(req.user.userId));
    res.status(StatusCodes.OK).json({
      user: serviceResult.user,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
      provider: "google",
      csrfToken: req.cookies.csrfToken,
    });
  } catch (err: any) {
    res.status(StatusCodes.NOT_FOUND).json({ message: err.message || "User not found" });
  }
};

// Check View Access
export const checkViewAccess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource } = req.query;
    if (!resource) {
      return res.status(StatusCodes.BAD_REQUEST).json({ allowed: false, message: "resource is required" });
    }

    let allowed = false;
    if (req.user) {
      allowed = await PermissionService.hasInstancePermission(req.user, String(resource), "read");
      if (!allowed) {
        allowed = await PermissionService.hasPermission(req.user, String(resource), "read");
      }
    }
    res.status(StatusCodes.OK).json({ allowed });
  } catch (err: any) {
    console.error("[checkViewAccess] Error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ allowed: false, message: err.message || "Internal server error" });
  }
};
