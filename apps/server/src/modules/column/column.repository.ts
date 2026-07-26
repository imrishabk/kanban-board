import { prisma } from "../../config/database";

export const columnRepository = {
  async create(data: { title: string; boardId: string; position: number }) {
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
    return prisma.columns.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.columns.findUnique({ where: { id } });
  },

  async getMaxPosition(boardId: string): Promise<number> {
    const column = await prisma.columns.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return column?.position ?? 0;
  },

  async update(id: string, data: Partial<{ title: string; position: number }>) {
    return prisma.columns.update({ where: { id }, data });
  },

  async deleteColumn(id: string) {
    return prisma.columns.delete({ where: { id } });
  },
};
