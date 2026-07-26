import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";
import { logger } from "../common/utils/logger";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn({ err, code: err.errorCode }, "Application error");
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.isOperational ? {} : { stack: err.stack }),
      },
    });
  }

  logger.error({ err }, "Unexpected error");
  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
    },
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: "Route not found",
    },
  });
};
