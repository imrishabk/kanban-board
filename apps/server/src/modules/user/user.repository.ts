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
  async findById(id: string) {
    return prisma.users.findUnique({ where: { id } });
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
};
