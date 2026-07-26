import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import {
  TaskNotFound,
  TaskAccessDenied,
  LabelNotFound,
  CommentNotFound,
  NotCommentAuthor,
} from "./task.errors";
import { taskRepository } from "./task.repository";
import { columnRepository } from "../column/column.repository";
import { boardRepository } from "../board/board.repository";
import { groupRepository } from "../group/group.repository";

async function verifyBoardAccess(boardId: string, userId: string) {
  const board = await boardRepository.findById(boardId);
  if (!board) {
    throw new TaskNotFound(`with board id ${boardId}`);
  }

  const isOwner = board.ownerId === userId;
  let isGroupMember = false;
  if (board.groupId) {
    isGroupMember = await groupRepository.isMember(board.groupId, userId);
  }

  if (!isOwner && !isGroupMember) {
    throw new TaskAccessDenied();
  }

  return board;
}

async function verifyTaskOwnership(taskId: string, userId: string) {
  const task = await taskRepository.findByIdWithRelations(taskId);
  if (!task) {
    throw new TaskNotFound(taskId);
  }

  const board = task.columns?.boards;
  if (!board) {
    throw new TaskNotFound(taskId);
  }

  if (board.ownerId !== userId) {
    throw new TaskAccessDenied();
  }

  return { task, board };
}

export const taskService = {
  async createTask(
    name: string,
    columnId: string,
    userId: string,
    description?: string,
    position?: number,
    assigneeId?: string,
    dueDate?: Date | null,
    labelIds?: string[],
  ) {
    if (!name || name.trim().length === 0) {
      throw new AppError("Task name is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!columnId) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const column = await columnRepository.findById(columnId);
    if (!column) {
      throw new TaskNotFound(`with column id ${columnId}`);
    }

    await verifyBoardAccess(column.boardId, userId);

    if (assigneeId) {
      const board = await boardRepository.findById(column.boardId);
      if (board?.groupId) {
        const isMember = await groupRepository.isMember(board.groupId, assigneeId);
        if (!isMember) {
          throw new AppError(
            "Assignee must be a board member!",
            400,
            true,
            ErrorCode.VALIDATION_FAILED,
          );
        }
      }
    }

    const maxPosition = await taskRepository.getMaxPosition(columnId);
    const taskPosition = position ?? maxPosition + 1;

    return taskRepository.create({
      name: name.trim(),
      columnId,
      description: description?.trim() ?? undefined,
      position: taskPosition,
      assigneeId,
      dueDate,
      labelIds,
    });
  },

  async getTaskById(id: string) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const task = await taskRepository.findByIdWithRelations(id);
    if (!task) {
      throw new TaskNotFound(id);
    }
    return task;
  },

  async getAllTasks(limit?: number, offset?: number) {
    if (limit !== undefined && offset !== undefined) {
      return taskRepository.findByPagination(limit, offset, true);
    }
    return taskRepository.findAll(true);
  },

  async getTasksByColumnId(columnId: string, userId: string) {
    if (!columnId) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const column = await columnRepository.findById(columnId);
    if (!column) {
      throw new TaskNotFound(`with column id ${columnId}`);
    }

    await verifyBoardAccess(column.boardId, userId);

    return taskRepository.findByColumnIdWithRelations(columnId);
  },

  async getFilteredTasks(
    userId: string,
    filter: {
      columnId?: string;
      assigneeId?: string;
      dueDateBefore?: Date;
      dueDateAfter?: Date;
      labelId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    return taskRepository.findByFilter({ ...filter, limit: filter.limit, offset: filter.offset });
  },

  async updateTask(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      position?: number;
      assigneeId?: string | null;
      dueDate?: Date | null;
      labelIds?: string[];
    },
  ) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    await verifyTaskOwnership(id, userId);

    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new AppError("Task name cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() ?? null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.labelIds !== undefined) updateData.labelIds = data.labelIds;

    return taskRepository.update(id, updateData);
  },

  async moveTask(id: string, userId: string, newColumnId: string, position: number) {
    if (!id || !userId || !newColumnId) {
      throw new AppError(
        "Task id, user id, and new column id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    await verifyTaskOwnership(id, userId);

    const newColumn = await columnRepository.findById(newColumnId);
    if (!newColumn) {
      throw new TaskNotFound(`with column id ${newColumnId}`);
    }

    await verifyBoardAccess(newColumn.boardId, userId);

    return taskRepository.update(id, { columnId: newColumnId, position });
  },

  async reorderTasks(columnId: string, userId: string, tasks: { id: string; position: number }[]) {
    if (!columnId || !userId || !tasks || tasks.length === 0) {
      throw new AppError(
        "Column id, user id, and tasks are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const column = await columnRepository.findById(columnId);
    if (!column) {
      throw new TaskNotFound(`with column id ${columnId}`);
    }

    await verifyBoardAccess(column.boardId, userId);

    const existingTasks = await taskRepository.findByColumnId(columnId);
    const existingIds = new Set(existingTasks.map((t) => t.id));
    for (const t of tasks) {
      if (!existingIds.has(t.id)) {
        throw new AppError(
          `Task ${t.id} does not belong to this column!`,
          400,
          true,
          ErrorCode.VALIDATION_FAILED,
        );
      }
    }

    const updates = tasks.map((t) => taskRepository.update(t.id, { position: t.position }));
    await Promise.all(updates);

    return taskRepository.findByColumnIdWithRelations(columnId);
  },

  async deleteTask(id: string, userId: string) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    await verifyTaskOwnership(id, userId);

    return taskRepository.delete(id);
  },

  // Labels
  async createLabel(name: string, boardId: string, userId: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError("Label name is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!boardId) {
      throw new AppError("Board id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    await verifyBoardAccess(boardId, userId);

    return taskRepository.createLabel({ title: name.trim(), boardId });
  },

  async getLabels(boardId?: string, userId?: string) {
    if (boardId) {
      if (!userId) {
        throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
      }
      await verifyBoardAccess(boardId, userId);
      return taskRepository.findLabelsByBoard(boardId);
    }
    return [];
  },

  async updateLabel(id: string, userId: string, data: { name?: string; color?: string }) {
    if (!id || !userId) {
      throw new AppError("Label id and user id are required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const label = await taskRepository.findLabelById(id);
    if (!label) {
      throw new LabelNotFound(id);
    }
    await verifyBoardAccess(label.boardId, userId);
    return taskRepository.updateLabel(id, { title: data.name, color: data.color });
  },

  async deleteLabel(id: string, userId: string) {
    if (!id || !userId) {
      throw new AppError("Label id and user id are required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const label = await taskRepository.findLabelById(id);
    if (!label) {
      throw new LabelNotFound(id);
    }
    await verifyBoardAccess(label.boardId, userId);
    return taskRepository.deleteLabel(id);
  },

  async addLabelsToTask(taskId: string, userId: string, labelIds: string[]) {
    if (!taskId || !userId || !labelIds || labelIds.length === 0) {
      throw new AppError(
        "Task id, user id, and label ids are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    await verifyTaskOwnership(taskId, userId);

    const taskWithColumn = await taskRepository.findByIdWithRelations(taskId);
    const boardId = taskWithColumn?.columns?.boardId;
    if (!boardId) {
      throw new TaskNotFound(taskId);
    }

    for (const labelId of labelIds) {
      const label = await taskRepository.findLabelById(labelId);
      if (!label || label.boardId !== boardId) {
        throw new AppError(
          `Label ${labelId} does not belong to this board!`,
          400,
          true,
          ErrorCode.VALIDATION_FAILED,
        );
      }
    }

    return taskRepository.addLabelsToTask(taskId, labelIds);
  },

  async removeLabelFromTask(taskId: string, userId: string, labelId: string) {
    if (!taskId || !userId || !labelId) {
      throw new AppError(
        "Task id, user id, and label id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    await verifyTaskOwnership(taskId, userId);
    return taskRepository.removeLabelFromTask(taskId, labelId);
  },

  // Comments
  async createComment(taskId: string, userId: string, content: string) {
    if (!taskId || !userId || !content) {
      throw new AppError(
        "Task id, user id, and content are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const task = await taskRepository.findByIdWithRelations(taskId);
    if (!task) {
      throw new TaskNotFound(taskId);
    }

    const board = task.columns?.boards;
    if (!board) {
      throw new TaskNotFound(taskId);
    }

    const isOwner = board.ownerId === userId;
    let isGroupMember = false;
    if (board.groupId) {
      isGroupMember = await groupRepository.isMember(board.groupId, userId);
    }
    const isAssignee = task.assigneeId === userId;

    if (!isOwner && !isGroupMember && !isAssignee) {
      throw new TaskAccessDenied();
    }

    return taskRepository.createComment({ content: content.trim(), taskId, authorId: userId });
  },

  async getComments(taskId: string, userId: string) {
    if (!taskId || !userId) {
      throw new AppError("Task id and user id are required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const task = await taskRepository.findByIdWithRelations(taskId);
    if (!task) {
      throw new TaskNotFound(taskId);
    }

    const board = task.columns?.boards;
    if (!board) {
      throw new TaskNotFound(taskId);
    }

    const isOwner = board.ownerId === userId;
    let isGroupMember = false;
    if (board.groupId) {
      isGroupMember = await groupRepository.isMember(board.groupId, userId);
    }
    const isAssignee = task.assigneeId === userId;

    if (!isOwner && !isGroupMember && !isAssignee) {
      throw new TaskAccessDenied();
    }

    return taskRepository.findCommentsByTask(taskId);
  },

  async updateComment(commentId: string, userId: string, content: string) {
    if (!commentId || !userId || !content) {
      throw new AppError(
        "Comment id, user id, and content are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const comment = await taskRepository.findCommentById(commentId);
    if (!comment) {
      throw new CommentNotFound(commentId);
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthor();
    }

    return taskRepository.updateComment(commentId, content.trim());
  },

  async deleteComment(commentId: string, userId: string) {
    if (!commentId || !userId) {
      throw new AppError(
        "Comment id and user id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const comment = await taskRepository.findCommentById(commentId);
    if (!comment) {
      throw new CommentNotFound(commentId);
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthor();
    }

    return taskRepository.deleteComment(commentId);
  },
};
