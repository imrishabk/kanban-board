import type { Request, Response, NextFunction } from "express";
import { taskRepository } from "../modules/task/task.repository";
import { columnRepository } from "../modules/column/column.repository";
import { boardRepository } from "../modules/board/board.repository";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";
import { TaskNotFound, TaskAccessDenied } from "../modules/task/task.errors";

export const requireTaskOwner = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }

  // Admin/Server bypass
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }

  const taskId = req.params.id as string;
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new TaskNotFound(taskId);
  }

  const column = await columnRepository.findById(task.columnId);
  if (!column) {
    throw new TaskNotFound(taskId);
  }

  const board = await boardRepository.findById(column.boardId);
  if (!board) {
    throw new TaskNotFound(taskId);
  }

  if (board.ownerId !== user.id) {
    throw new TaskAccessDenied();
  }

  next();
};
