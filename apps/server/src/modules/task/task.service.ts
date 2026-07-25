import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { TaskNotFound } from "./task.errors";
import { taskRepository } from "./task.repository";

export const taskService = {
  async createTask(name: string, columnId: string, description?: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError("Task name is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!columnId) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const task = await taskRepository.create({
      name: name.trim(),
      columnId,
      description: description?.trim() ?? undefined,
    });
    return task;
  },

  async getTaskById(id: string) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const task = await taskRepository.findById(id);
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

  async getTasksByColumnId(columnId: string) {
    if (!columnId) {
      throw new AppError("Column id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    return taskRepository.findByColumnId(columnId, true);
  },

  async updateTask(id: string, data: { name?: string; description?: string; columnId?: string }) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw new TaskNotFound(id);
    }
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new AppError("Task name cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    const updateData: { name?: string; description?: string; columnId?: string } = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.columnId !== undefined) updateData.columnId = data.columnId;
    const task = taskRepository.update(id, updateData);
    if (!task) {
      throw new TaskNotFound(id);
    }
    return task;
  },

  async deleteTask(id: string) {
    if (!id) {
      throw new AppError("Task id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw new TaskNotFound(id);
    }
    return taskRepository.delete(id);
  },
};
