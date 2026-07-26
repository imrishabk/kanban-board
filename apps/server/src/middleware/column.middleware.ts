import type { Request, Response, NextFunction } from "express";
import { columnRepository } from "../modules/column/column.repository";
import { boardRepository } from "../modules/board/board.repository";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";
import { ColumnNotFound, ColumnAccessDenied } from "../modules/column/column.errors";

export const requireColumnOwner = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }

  // Admin/Server bypass
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }

  const columnId = req.params.id as string;
  const column = await columnRepository.findById(columnId);

  if (!column) {
    throw new ColumnNotFound(columnId);
  }

  const board = await boardRepository.findById(column.boardId);
  if (!board) {
    throw new ColumnNotFound(columnId);
  }

  if (board.ownerId !== user.id) {
    throw new ColumnAccessDenied();
  }

  next();
};
