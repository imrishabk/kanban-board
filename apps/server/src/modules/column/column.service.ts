import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { ColumnNotFound } from "./column.errors";
import { columnRepository } from "./column.repository";

export const columnService = {
  async createColumn(title: string, boardId: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Column title is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!boardId) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const column = await columnRepository.create({ title: title.trim(), boardId });
    return column;
  },

  async getColumnById(id: string) {
    if (!id) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const column = await columnRepository.findById(id);
    if (!column) {
      throw new ColumnNotFound(id);
    }
    return column;
  },

  async getAllColumns(limit?: number, offset?: number) {
    if (limit !== undefined && offset !== undefined) {
      return columnRepository.findByPagination(limit, offset, true);
    }
    return columnRepository.findAll(true);
  },

  async getColumnsByBoardId(boardId: string) {
    if (!boardId) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    return columnRepository.findByBoardId(boardId);
  },

  async updateColumn(id: string, data: { title?: string }) {
    if (!id) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await columnRepository.findById(id);
    if (!existing) {
      throw new ColumnNotFound(id);
    }
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError("Column title cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    const updateData: { title?: string } = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    return columnRepository.update(id, updateData);
  },

  async deleteColumn(id: string) {
    if (!id) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await columnRepository.findById(id);
    if (!existing) {
      throw new ColumnNotFound(id);
    }
    return columnRepository.deleteColumn(id);
  },
};
