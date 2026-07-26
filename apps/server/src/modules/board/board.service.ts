import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { BoardNotFound, BoardAccessDenied } from "./board.errors";
import { boardRepository } from "./board.repository";
import { groupRepository } from "../group/group.repository";

export const boardService = {
  async createBoard(title: string, ownerId?: string, groupId?: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Board title is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (groupId) {
      const isMember = await groupRepository.isMember(groupId, ownerId!);
      if (!isMember) {
        throw new BoardAccessDenied();
      }
    }
    const board = await boardRepository.create({ title: title.trim(), ownerId, groupId });
    return board;
  },

  async getBoardById(id: string) {
    if (!id) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const board = await boardRepository.findById(id);
    if (!board) {
      throw new BoardNotFound(id);
    }
    return board;
  },

  async getAllBoards(limit?: number, offset?: number) {
    if (limit !== undefined && offset !== undefined) {
      return boardRepository.findByPagination(limit, offset, true);
    }
    return boardRepository.findAll(true);
  },

  async getBoardsByOwner(ownerId: string, limit?: number, offset?: number) {
    if (!ownerId) {
      throw new AppError("Owner id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (limit !== undefined && offset !== undefined) {
      return boardRepository.findByOwner(ownerId, true);
    }
    return boardRepository.findByOwner(ownerId, true);
  },

  async getBoardsByGroup(groupId: string, limit?: number, offset?: number) {
    if (!groupId) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (limit !== undefined && offset !== undefined) {
      return boardRepository.findByGroup(groupId, true);
    }
    return boardRepository.findByGroup(groupId, true);
  },

  async updateBoard(id: string, userId: string, data: { title?: string; groupId?: string }) {
    if (!id) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await boardRepository.findById(id);
    if (!existing) {
      throw new BoardNotFound(id);
    }

    // Check ownership
    if (existing.ownerId !== userId) {
      throw new BoardAccessDenied();
    }

    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError("Board title cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    // If changing groupId, verify membership
    if (data.groupId !== undefined && data.groupId !== existing.groupId) {
      if (data.groupId) {
        const isMember = await groupRepository.isMember(data.groupId, userId);
        if (!isMember) {
          throw new BoardAccessDenied();
        }
      }
    }

    const updateData: { title?: string; groupId?: string } = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.groupId !== undefined) updateData.groupId = data.groupId;
    return boardRepository.update(id, updateData);
  },

  async transferOwnership(boardId: string, currentOwnerId: string, newOwnerId: string) {
    if (!boardId || !currentOwnerId || !newOwnerId) {
      throw new AppError(
        "Board id, current owner id, and new owner id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new BoardNotFound(boardId);
    }

    if (board.ownerId !== currentOwnerId) {
      throw new BoardAccessDenied();
    }

    if (board.ownerId === newOwnerId) {
      throw new AppError("User is already the owner!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    // If board has a group, new owner must be a member
    if (board.groupId) {
      const isMember = await groupRepository.isMember(board.groupId, newOwnerId);
      if (!isMember) {
        throw new AppError(
          "New owner must be a member of the board's group!",
          400,
          true,
          ErrorCode.VALIDATION_FAILED,
        );
      }
    }

    return boardRepository.update(boardId, { ownerId: newOwnerId });
  },

  async deleteBoard(id: string) {
    if (!id) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await boardRepository.findById(id);
    if (!existing) {
      throw new BoardNotFound(id);
    }
    return boardRepository.delete(id);
  },
};
