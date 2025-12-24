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

// Define Transaction Client Type
type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class AuthService {
  async loginWithGoogle(googleToken: string) {
    if (!googleToken) throw new Error("Google token is required");

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new Error("Invalid Google Token");
    }

    if (!payload?.email) throw new Error("Invalid Google token payload");

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

        if (!defaultRole) {
          defaultRole = await tx.role.create({
            data: { name: DEFAULT_USER_ROLE, description: "Default User Role" },
          });
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

      await tx.session.create({
        data: {
          userId: user.id,
          accessToken,
          refreshToken,
          csrfToken,
          provider: "google",
          expiresAt,
        },
      });

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

  async logout(refreshToken: string, txClient?: TxClient) {
    if (!refreshToken) return;
    const client = txClient ?? prisma;
    await client.session.deleteMany({ where: { refreshToken } });
  }

  async refreshToken(oldRefreshToken: string, txClient?: TxClient) {
    if (!oldRefreshToken) throw new Error("Refresh token required");
    const client = txClient ?? prisma;

    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (e) {
      throw new Error("Invalid Refresh Token format");
    }

    // Verify Session existence matches Token AND User
    const storedSession = await client.session.findFirst({
      where: {
        refreshToken: oldRefreshToken,
        userId: payload.userId,
      },
    });

    if (!storedSession) {
      // Possible Token Reuse Attack -> Could invalidate all user sessions here for security
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

    // Rotate Token: Update EXISTING session
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

  async getCurrentUser(userId: string, txClient?: TxClient) {
    if (!userId) throw new Error("User ID required");
    const client = txClient ?? prisma;

    const userWithRoles = await client.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      include: {
                        operation: true,
                        asset: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) throw new Error("User not found");

    // Flatten permissions safely
    // Safe extraction
    const permissions = Array.from(
      new Set(
        userWithRoles.userRoles.flatMap(
          (ur) =>
            ur.role.rolePermissions?.map((rp) => {
              const op = rp.permission.operation?.name || "unknown";
              const asset = rp.permission.asset?.tableName || "unknown";
              return `${op}:${asset}`;
            }) ?? []
        )
      )
    );
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
