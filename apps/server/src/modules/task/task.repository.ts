import { prisma } from "../../config/database";
import type { Tasks, TaskLabel, TaskComment } from "../../generated/prisma/client";

export const taskRepository = {
  async create(data: {
    name: string;
    description?: string;
    columnId: string;
    position?: number;
    assigneeId?: string;
    dueDate?: Date | null;
    labelIds?: string[];
  }) {
    const { labelIds, ...taskData } = data;
    return prisma.tasks.create({
      data: {
        ...taskData,
        labels: labelIds
          ? {
              create: labelIds.map((labelId) => ({ label: { connect: { id: labelId } } })),
            }
          : undefined,
      },
    });
  },

  async findAll(descending?: boolean) {
    return prisma.tasks.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
      include: { labels: { include: { label: true } } },
    });
  },

  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.tasks.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
      take: limit,
      skip: offset,
      include: { labels: { include: { label: true } } },
    });
  },

  async findById(id: string) {
    return prisma.tasks.findUnique({
      where: { id },
      include: { labels: { include: { label: true } } },
    });
  },

  async findByIdWithRelations(id: string) {
    return prisma.tasks.findUnique({
      where: { id },
      include: {
        labels: { include: { label: true } },
        comments: { include: { author: true } },
        columns: { include: { boards: true } },
      },
    });
  },

  async findByColumnId(columnId: string, descending?: boolean) {
    return prisma.tasks.findMany({
      where: { columnId },
      orderBy: { position: descending ? "desc" : "asc" },
      include: { labels: { include: { label: true } } },
    });
  },

  async findByColumnIdWithRelations(columnId: string): Promise<
    (Tasks & {
      labels: { label: TaskLabel }[];
      comments: (TaskComment & { author: any })[];
    })[]
  > {
    return prisma.tasks.findMany({
      where: { columnId },
      orderBy: { position: "asc" },
      include: {
        labels: { include: { label: true } },
        comments: { include: { author: true } },
      },
    });
  },

  async findByFilter(filter: {
    columnId?: string;
    assigneeId?: string;
    dueDateBefore?: Date;
    dueDateAfter?: Date;
    labelId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filter.columnId) where.columnId = filter.columnId;
    if (filter.assigneeId) where.assigneeId = filter.assigneeId;
    if (filter.dueDateBefore) where.dueDate = { lte: filter.dueDateBefore };
    if (filter.dueDateAfter) where.dueDate = { ...where.dueDate, gte: filter.dueDateAfter };
    if (filter.labelId) where.labels = { some: { labelId: filter.labelId } };

    return prisma.tasks.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filter.limit,
      skip: filter.offset,
      include: { labels: { include: { label: true } } },
    });
  },

  async getMaxPosition(columnId: string): Promise<number> {
    const task = await prisma.tasks.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return task?.position ?? 0;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      position: number;
      assigneeId: string | null;
      dueDate: Date | null;
      columnId: string;
      labelIds: string[];
    }>,
  ) {
    const { labelIds, ...taskData } = data;
    const updateData: any = { ...taskData };
    if (labelIds !== undefined) {
      updateData.labels = { set: labelIds.map((id) => ({ id })) };
    }
    return prisma.tasks.update({ where: { id }, data: updateData });
  },

  async delete(id: string) {
    return prisma.tasks.delete({ where: { id } });
  },

  // Labels
  async createLabel(data: { title: string; boardId: string }) {
    return prisma.taskLabel.create({ data });
  },

  async findLabelById(id: string) {
    return prisma.taskLabel.findUnique({ where: { id } });
  },

  async findLabelsByBoard(boardId: string) {
    return prisma.taskLabel.findMany({ where: { boardId } });
  },

  async updateLabel(id: string, data: Partial<{ title: string; color: string }>) {
    return prisma.taskLabel.update({ where: { id }, data });
  },

  async deleteLabel(id: string) {
    return prisma.taskLabel.delete({ where: { id } });
  },

  async addLabelsToTask(taskId: string, labelIds: string[]) {
    return prisma.tasks.update({
      where: { id: taskId },
      data: {
        labels: {
          connect: labelIds.map((labelId) => ({
            taskId_labelId: { taskId, labelId },
          })),
        },
      },
    });
  },

  async removeLabelFromTask(taskId: string, labelId: string) {
    return prisma.tasks.update({
      where: { id: taskId },
      data: {
        labels: {
          disconnect: { taskId_labelId: { taskId, labelId } },
        },
      },
    });
  },

  // Comments
  async createComment(data: { content: string; taskId: string; authorId: string }) {
    return prisma.taskComment.create({ data });
  },

  async findCommentById(id: string) {
    return prisma.taskComment.findUnique({ where: { id } });
  },

  async findCommentsByTask(taskId: string) {
    return prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    });
  },

  async updateComment(id: string, content: string) {
    return prisma.taskComment.update({ where: { id }, data: { content } });
  },

  async deleteComment(id: string) {
    return prisma.taskComment.delete({ where: { id } });
  },
};
