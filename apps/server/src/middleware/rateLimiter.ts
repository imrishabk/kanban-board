import rateLimit from "express-rate-limit";
import { ErrorCode } from "../common/errors/errorCodes";

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10),
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "2000", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: "Too many requests, please try again later",
    },
  },
  skip: (_req) => _req.url === "/health",
});

export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10),
  limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? "20", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: "Too many authentication attempts, please try again later",
    },
  },
});
