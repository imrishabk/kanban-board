import { prisma } from "../../config/database";

export const boardRepository = {
  async create(data: { title: string; ownerId?: string; groupId?: string }) {
    return prisma.boards.create({ data });
  },
  async findAll(descending?: boolean) {
    return prisma.boards.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },
  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.boards.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },
  async findById(id: string) {
    return prisma.boards.findUnique({ where: { id } });
  },
  async findByOwner(ownerId: string, descending?: boolean) {
    return prisma.boards.findMany({
      where: { ownerId },
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },
  async findByGroup(groupId: string, descending?: boolean) {
    return prisma.boards.findMany({
      where: { groupId },
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },
  async update(id: string, data: Partial<{ title: string; ownerId: string; groupId: string }>) {
    return prisma.boards.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.boards.delete({ where: { id } });
  },
};
