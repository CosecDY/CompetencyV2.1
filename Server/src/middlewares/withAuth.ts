import { RequestHandler } from "express";
import { authenticate, authorizeRole, authorizeInstance } from "./authMiddleware";

interface AuthOptions {
  resource?: string;
  action?: string;
  roles?: string | string[];
}

// ใช้ RequestHandler type ของ Express
export const withAuth = (options: AuthOptions, handler: RequestHandler): RequestHandler[] => {
  const middlewares: RequestHandler[] = [authenticate];

  if (options.roles) {
    middlewares.push(authorizeRole(options.roles));
  } else if (options.resource && options.action) {
    // Wrapper function เพื่อ handle async error ใน middleware
    const instanceMiddleware: RequestHandler = async (req, res, next) => {
      try {
        await authorizeInstance(options.resource!, options.action!)(req, res, next);
      } catch (err) {
        next(err);
      }
    };
    middlewares.push(instanceMiddleware);
  }

  return [...middlewares, handler];
};
