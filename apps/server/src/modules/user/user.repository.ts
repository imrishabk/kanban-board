import { prisma } from "../../config/database";

export const userRepository = {
  async create(data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    isActive: boolean;
  }) {
    return prisma.users.create({ data });
  },

  async findAll(descending?: boolean) {
    return prisma.users.findMany({ where: { createdAt: descending ? "desc" : "asc" } });
  },

  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.users.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
      take: limit,
      skip: offset,
    });
  },

  async findById(id: string) {
    return prisma.users.findUnique({ where: { id } });
  },

  async findByUsername(username: string) {
    return prisma.users.findUnique({ where: { username } });
  },
  async findByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
  },

  async update(
    id: string,
    data: Partial<{ username: string; email: string; password: string; displayName: string }>,
  ) {
    return prisma.users.update({ where: { id }, data });
  },

  async activate(id: string) {
    return prisma.users.update({ where: { id }, data: { isActive: true } });
  },

  async deactivate(id: string) {
    return prisma.users.update({ where: { id }, data: { isActive: false } });
  },

  async delete(id: string) {
    return prisma.users.delete({ where: { id } });
  },
};
