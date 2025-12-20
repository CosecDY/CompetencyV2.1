import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";

// --------------------- Types ---------------------
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
// --------------------------------------------------

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not defined`);
  return value;
};

/**
 * Generate a signed JWT access token.
 *
 * @param {AccessTokenPayload} payload
 *   An object containing the user’s ID, email, and role to include in the token payload.
 *
 * @returns {string}
 *   The signed JWT access token as a string.
 *
 * @throws {Error}
 *   If required environment variables (JWT_REFRESH_SECRET_KEY or JWT_REFRESH_EXPIRATION) are missing or invalid.
 */
export const generateToken = (payload: AccessTokenPayload): string => {
  const secret = getEnvVar("JWT_ACCESS_SECRET_KEY");
  const expirationEnv = getEnvVar("JWT_ACCESS_EXPIRATION");
  const isNumeric = /^\d+$/.test(expirationEnv);

  let expiration: string | number;

  if (isNumeric) {
    expiration = parseInt(expirationEnv, 10);
  } else {
    expiration = expirationEnv;
  }

  return jwt.sign(payload, secret as Secret, { expiresIn: expiration } as SignOptions);
};

/**
 * Verify and decode a JWT access token.
 *
 * @param {string} token
 *   The JWT access token string to verify and decode.
 *
 * @returns {AccessTokenPayload}
 *   The decoded payload containing userId, email, and role.
 *
 * @throws {Error}
 *   If the token is invalid, expired, or the secret is missing.
 */
export const verifyToken = (token: string): AccessTokenPayload => {
  const secret = getEnvVar("JWT_ACCESS_SECRET_KEY");

  try {
    return jwt.verify(token, secret as Secret) as AccessTokenPayload;
  } catch (error: any) {
    console.error("verifyToken Failed:", error.message);

    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token signature or format");
    }

    throw new Error("Invalid token");
  }
};

/**
 * Generate a signed JWT refresh token.
 *
 * @param {RefreshTokenPayload} payload
 *   An object containing the user’s ID to include in the refresh token payload.
 *
 * @returns {string}
 *   The signed JWT refresh token as a string.
 *
 * @throws {Error}
 *   If required environment variables (JWT_REFRESH_SECRET_KEY or JWT_REFRESH_EXPIRATION) are missing or invalid.
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret = getEnvVar("JWT_REFRESH_SECRET_KEY");
  const expiration = parseInt(getEnvVar("JWT_REFRESH_EXPIRATION"), 10);
  return jwt.sign(payload, secret as Secret, { expiresIn: expiration });
};

/**
 * Verify and decode a JWT refresh token.
 *
 * @param {string} token
 *   The JWT refresh token string to verify and decode.
 *
 * @returns {RefreshTokenPayload}
 *   The decoded payload containing userId.
 *
 * @throws {Error}
 *   If the token is invalid, expired, or the refresh secret is missing.
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = getEnvVar("JWT_REFRESH_SECRET_KEY");
  try {
    return jwt.verify(token, secret as Secret) as RefreshTokenPayload;
  } catch (error: any) {
    console.error("verifyRefreshToken error:", error);
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
};

/**
 * Generate a cryptographically secure CSRF token.
 *
 * @param {number} length - Length of the token in bytes (default 32 bytes → 64 hex chars)
 * @returns {string} - A random CSRF token
 */
export const generateCsrfToken = (length = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};
