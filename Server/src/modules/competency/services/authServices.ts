import { PrismaClient, User, UserRole, Role, RolePermission, Permission, Session } from "@prisma/client_competency";
import { generateToken, generateRefreshToken, generateCsrfToken, verifyRefreshToken } from "@Utils/tokenUtils";
import { OAuth2Client } from "google-auth-library";
import { SessionService } from "@/modules/admin/services/rbac/sessionService";

const prisma = new PrismaClient();
const sessionService = new SessionService();
const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE || "User";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID env variable");

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper สำหรับคำนวณวันหมดอายุ (7 วัน)
const getRefreshTokenExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

type UserWithRoles = User & {
  userRoles: (UserRole & {
    role: Role & {
      rolePermissions?: (RolePermission & { permission: Permission })[];
    };
  })[];
};

class AuthService {
  async loginWithGoogle(googleToken: string) {
    if (!googleToken) throw new Error("Google token is required");

    // Verify token
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

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const defaultRole = await prisma.role.findUnique({
        where: { name: DEFAULT_USER_ROLE },
      });
      if (!defaultRole) throw new Error(`Default role "${DEFAULT_USER_ROLE}" not found`);

      user = await prisma.user.create({
        data: {
          email,
          firstNameEN,
          lastNameEN,
          profileImage,
          userRoles: {
            create: [{ roleId: defaultRole.id }],
          },
        },
        include: { userRoles: true },
      });
    }

    // Load roles
    const userWithRoles = (await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
        },
      },
    })) as UserWithRoles | null;

    const primaryRole = userWithRoles?.userRoles[0]?.role?.name ?? DEFAULT_USER_ROLE;

    // Generate tokens
    const accessToken = generateToken({ userId: user.id, email: user.email, role: primaryRole });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const csrfToken = generateCsrfToken();

    // Upsert session
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
  }

  async logout(refreshToken: string, txClient?: PrismaClient) {
    if (!refreshToken) throw new Error("Refresh token required");
    const client = txClient ?? prisma;
    await client.session.deleteMany({ where: { refreshToken } });
  }

  async refreshToken(oldRefreshToken: string, txClient?: PrismaClient) {
    if (!oldRefreshToken) throw new Error("Refresh token required");

    const client = txClient ?? prisma;

    // 1. Verify JWT signature
    const payload = verifyRefreshToken(oldRefreshToken);

    // 2. Check DB Session
    const storedSession = await client.session.findFirst({ where: { userId: payload.userId } });
    if (!storedSession || storedSession.refreshToken !== oldRefreshToken) {
      if (storedSession) await client.session.delete({ where: { id: storedSession.id } });
      throw new Error("Invalid refresh token");
    }

    const userWithRoles = await client.user.findUnique({
      where: { id: payload.userId },
      include: { userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } } },
    });
    if (!userWithRoles) throw new Error("User not found");

    const primaryRole = userWithRoles.userRoles[0]?.role.name ?? DEFAULT_USER_ROLE;

    // 3. Generate NEW Tokens
    const newRefreshToken = generateRefreshToken({ userId: payload.userId });
    const accessToken = generateToken({ userId: userWithRoles.id, email: userWithRoles.email, role: primaryRole });
    const csrfToken = generateCsrfToken();
    const expiresAt = getRefreshTokenExpiry();

    await sessionService.upsertSession(userWithRoles.id, accessToken, newRefreshToken, csrfToken, "google", expiresAt);

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

    const userWithRoles = (await client.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } } },
    })) as UserWithRoles | null;

    if (!userWithRoles) throw new Error("User not found");

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
