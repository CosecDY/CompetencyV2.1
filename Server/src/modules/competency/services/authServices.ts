import { PrismaClient, Prisma } from "@prisma/client_competency";
import { generateToken, generateRefreshToken, generateCsrfToken, verifyRefreshToken } from "@Utils/tokenUtils";
import { OAuth2Client } from "google-auth-library";
import { SessionService } from "@/modules/admin/services/rbac/sessionService";

const prisma = new PrismaClient();
const sessionService = new SessionService();
const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE || "User";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID env variable");

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const getRefreshTokenExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// Use Prisma Helper for safer typing
type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } };
        };
      };
    };
  };
}>;

class AuthService {
  async loginWithGoogle(googleToken: string) {
    if (!googleToken) throw new Error("Google token is required");

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Invalid Google token");

    const email = payload.email!;
    const firstNameEN = payload.given_name ?? "";
    const lastNameEN = payload.family_name ?? "";
    const profileImage = payload.picture ?? "noimage.jpg";
    const expiresAt = getRefreshTokenExpiry();

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or Create User
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        let defaultRole = await tx.role.findUnique({ where: { name: DEFAULT_USER_ROLE } });

        // Auto-create role if missing (Robustness)
        if (!defaultRole) {
          console.warn(`Role '${DEFAULT_USER_ROLE}' not found. Creating automatically.`);
          defaultRole = await tx.role.create({ data: { name: DEFAULT_USER_ROLE, description: "Default User Role" } });
        }

        user = await tx.user.create({
          data: {
            email,
            firstNameEN,
            lastNameEN,
            profileImage,
            userRoles: { create: [{ roleId: defaultRole.id }] },
          },
        });
      }

      // 2. Load Roles
      const userWithRoles = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { userRoles: { include: { role: true } } },
      });

      const primaryRole = userWithRoles.userRoles[0]?.role?.name ?? DEFAULT_USER_ROLE;

      // 3. Generate Tokens
      const accessToken = generateToken({ userId: user.id, email: user.email, role: primaryRole });
      const refreshToken = generateRefreshToken({ userId: user.id });
      const csrfToken = generateCsrfToken();

      // 4. Create Session (Upsert might not be best if allowing multiple devices, Create is safer for new login)
      await sessionService.upsertSession(user.id, accessToken, refreshToken, csrfToken, "google", expiresAt);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstNameEN,
          lastName: user.lastNameEN,
          profileImage: user.profileImage,
          role: primaryRole,
        },
        accessToken,
        refreshToken,
        expiresIn: 3600,
        csrfToken,
      };
    });

    return result;
  }

  async logout(refreshToken: string, txClient?: PrismaClient) {
    if (!refreshToken) return; // Idempotent: if no token, do nothing
    const client = txClient ?? prisma;
    await client.session.deleteMany({ where: { refreshToken } });
  }

  async refreshToken(oldRefreshToken: string, txClient?: PrismaClient) {
    if (!oldRefreshToken) throw new Error("Refresh token required");
    const client = txClient ?? prisma;

    const payload = verifyRefreshToken(oldRefreshToken);

    // [CRITICAL FIX] Verify the SPECIFIC session, not just any session for this user
    const storedSession = await client.session.findFirst({
      where: {
        refreshToken: oldRefreshToken, // Must match the token
        userId: payload.userId,
      },
    });

    if (!storedSession) {
      // Token Reuse Detection Logic could go here (Security Alert)
      throw new Error("Invalid or expired refresh token");
    }

    const userWithRoles = await client.user.findUnique({
      where: { id: payload.userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!userWithRoles) throw new Error("User not found");

    const primaryRole = userWithRoles.userRoles[0]?.role.name ?? DEFAULT_USER_ROLE;

    const newRefreshToken = generateRefreshToken({ userId: payload.userId });
    const accessToken = generateToken({ userId: userWithRoles.id, email: userWithRoles.email, role: primaryRole });
    const csrfToken = generateCsrfToken();
    const expiresAt = getRefreshTokenExpiry();

    // Rotate Token: Update the EXISTING session with new tokens
    await client.session.update({
      where: { id: storedSession.id },
      data: {
        refreshToken: newRefreshToken,
        accessToken: accessToken,
        csrfToken: csrfToken,
        expiresAt: expiresAt,
        updatedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
      csrfToken,
    };
  }

  async getCurrentUser(userId: string, txClient?: PrismaClient) {
    if (!userId) throw new Error("User ID required");
    const client = txClient ?? prisma;

    const userWithRoles = await client.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!userWithRoles) throw new Error("User not found");

    // Safe extraction
    const permissions = userWithRoles.userRoles.flatMap((ur) => ur.role.rolePermissions?.map((rp) => rp.permission.id.toString()) ?? []);
    const primaryRole = userWithRoles.userRoles[0]?.role.name ?? DEFAULT_USER_ROLE;

    return {
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        firstName: userWithRoles.firstNameEN,
        lastName: userWithRoles.lastNameEN,
        profileImage: userWithRoles.profileImage,
        role: primaryRole,
      },
      permissions,
    };
  }
}

export default new AuthService();
