import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { BoardNotFound } from "./board.errors";
import { boardRepository } from "./board.repository";

export const boardService = {
  async createBoard(title: string, ownerId?: string, groupId?: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Board title is required!", 400, true, ErrorCode.MISSING_FIELD);
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

  async getBoardsByOwner(ownerId: string) {
    if (!ownerId) {
      throw new AppError("Owner id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    return boardRepository.findByOwner(ownerId, true);
  },

  async getBoardsByGroup(groupId: string) {
    if (!groupId) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    return boardRepository.findByGroup(groupId, true);
  },

  async updateBoard(id: string, data: { title?: string; ownerId?: string; groupId?: string }) {
    if (!id) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await boardRepository.findById(id);
    if (!existing) {
      throw new BoardNotFound(id);
    }
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError("Board title cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    const updateData: { title?: string; ownerId?: string; groupId?: string } = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;
    if (data.groupId !== undefined) updateData.groupId = data.groupId;
    return boardRepository.update(id, updateData);
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
