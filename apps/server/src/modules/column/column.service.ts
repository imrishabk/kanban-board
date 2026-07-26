import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { ColumnNotFound, ColumnAccessDenied } from "./column.errors";
import { columnRepository } from "./column.repository";
import { boardRepository } from "../board/board.repository";

export const columnService = {
  async createColumn(title: string, boardId: string, userId: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Column title is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!boardId) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    // Verify board ownership
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new ColumnNotFound(`with board id ${boardId}`);
    }
    if (board.ownerId !== userId) {
      throw new ColumnAccessDenied();
    }

    // Get max position for this board
    const maxPosition = await columnRepository.getMaxPosition(boardId);
    const column = await columnRepository.create({
      title: title.trim(),
      boardId,
      position: maxPosition + 1,
    });
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

  async getColumnsByBoardId(boardId: string, userId: string) {
    if (!boardId) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    // Verify board access
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new ColumnNotFound(`with board id ${boardId}`);
    }

    // Check if user is owner or group member
    const isOwner = board.ownerId === userId;
    let isGroupMember = false;
    if (board.groupId) {
      const { groupRepository } = await import("../group/group.repository");
      isGroupMember = await groupRepository.isMember(board.groupId, userId);
    }

    if (!isOwner && !isGroupMember) {
      throw new ColumnAccessDenied();
    }

    return columnRepository.findByBoardId(boardId);
  },

  async updateColumn(id: string, userId: string, data: { title?: string }) {
    if (!id) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await columnRepository.findById(id);
    if (!existing) {
      throw new ColumnNotFound(id);
    }

    // Verify board ownership
    const board = await boardRepository.findById(existing.boardId);
    if (!board) {
      throw new ColumnNotFound(id);
    }
    if (board.ownerId !== userId) {
      throw new ColumnAccessDenied();
    }

    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError("Column title cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    const updateData: { title?: string } = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    return columnRepository.update(id, updateData);
  },

  async deleteColumn(id: string, userId: string) {
    if (!id) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await columnRepository.findById(id);
    if (!existing) {
      throw new ColumnNotFound(id);
    }

    // Verify board ownership
    const board = await boardRepository.findById(existing.boardId);
    if (!board) {
      throw new ColumnNotFound(id);
    }
    if (board.ownerId !== userId) {
      throw new ColumnAccessDenied();
    }

    return columnRepository.deleteColumn(id);
  },

  async reorderColumns(
    boardId: string,
    userId: string,
    columns: { id: string; position: number }[],
  ) {
    if (!boardId || !userId || !columns || columns.length === 0) {
      throw new AppError(
        "Board id, user id, and columns are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    // Verify board ownership
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new ColumnNotFound(`with board id ${boardId}`);
    }
    if (board.ownerId !== userId) {
      throw new ColumnAccessDenied();
    }

    // Verify all columns belong to this board
    const existingColumns = await columnRepository.findByBoardId(boardId);
    const existingIds = new Set(existingColumns.map((c) => c.id));
    for (const col of columns) {
      if (!existingIds.has(col.id)) {
        throw new AppError(
          `Column ${col.id} does not belong to this board!`,
          400,
          true,
          ErrorCode.VALIDATION_FAILED,
        );
      }
    }

    // Update positions in a transaction
    const updates = columns.map((col) =>
      columnRepository.update(col.id, { position: col.position }),
    );
    await Promise.all(updates);

    // Return updated columns
    return columnRepository.findByBoardId(boardId);
  },
};
