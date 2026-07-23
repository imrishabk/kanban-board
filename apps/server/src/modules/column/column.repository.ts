import { prisma } from "../../config/database";

export const columnRepository = {
  async create(data: { title: string; boardId: string }) {
    return prisma.columns.create({ data });
  },
  async findAll(descending?: boolean) {
    return prisma.columns.findMany({ orderBy: { createdAt: descending ? "desc" : "asc" } });
  },
  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.columns.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
      take: limit,
      skip: offset,
    });
  },
  async findByBoardId(boardId: string) {
    return prisma.columns.findMany({ where: { boardId } });
  },
  async update(id: string, data: Partial<{ title: string }>) {
    return prisma.columns.update({ where: { id }, data });
  },
  async deleteColumn(id: string) {
    return prisma.columns.delete({ where: { id } });
  },
};
