import type { Request, Response, NextFunction } from "express";
import { boardRepository } from "../modules/board/board.repository";
import { groupRepository } from "../modules/group/group.repository";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";
import { BoardNotFound, BoardAccessDenied } from "../modules/board/board.errors";

export const requireBoardOwner = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }

  // Admin/Server bypass
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }

  const boardId = req.params.id as string;
  const board = await boardRepository.findById(boardId);

  if (!board) {
    throw new BoardNotFound(boardId);
  }

  if (board.ownerId !== user.id) {
    throw new BoardAccessDenied();
  }

  next();
};

export const requireBoardAccess = async (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    throw new AppError("Authentication required", 401, true, ErrorCode.INVALID_CREDENTIALS);
  }

  // Admin/Server bypass
  if (user.id === "SERVER" || user.role === "ADMIN") {
    return next();
  }

  const boardId = req.params.id as string;
  const board = await boardRepository.findById(boardId);

  if (!board) {
    throw new BoardNotFound(boardId);
  }

  const isOwner = board.ownerId === user.id;
  let isGroupMember = false;
  if (board.groupId) {
    isGroupMember = await groupRepository.isMember(board.groupId, user.id);
  }

  if (!isOwner && !isGroupMember) {
    throw new BoardAccessDenied();
  }

  next();
};
