import type { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }
  throw new AppError("Admin access required", 403, true, ErrorCode.FORBIDDEN);
};

export const requireSelfOrAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }
  const targetId = req.params.id;
  if (user.id === targetId || user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }
  throw new AppError("Access denied", 403, true, ErrorCode.FORBIDDEN);
};

export const requireServerOrAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }
  throw new AppError("Server or admin access required", 403, true, ErrorCode.FORBIDDEN);
};
