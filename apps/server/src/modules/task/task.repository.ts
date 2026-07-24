import { prisma } from "../../config/database";

export const taskRepository = {
  async create(data: { name: string; description?: string; columnId: string }) {
    return prisma.tasks.create({ data });
  },
  async findAll(descending?: boolean) {
    return prisma.tasks.findMany({ orderBy: { createdAt: descending ? "desc" : "asc" } });
  },
  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.tasks.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
      take: limit,
      skip: offset,
    });
  },
  async findById(id: string) {
    return prisma.tasks.findUnique({ where: { id } });
  },
  async findByColumnId(columnId: string, descending?: boolean) {
    return prisma.tasks.findMany({
      where: { columnId },
      orderBy: { updatedAt: descending ? "desc" : "asc" },
    });
  },
  async update(id: string, data: Partial<{ name: string; description: string; columnId: string }>) {
    return prisma.tasks.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.tasks.delete({ where: { id } });
  },
};
