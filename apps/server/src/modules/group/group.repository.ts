import { prisma } from "../../config/database";

export const groupRepository = {
  async create(data: { title: string; ownerId: string }) {
    return prisma.groups.create({ data });
  },

  async findAll(descending?: boolean) {
    return prisma.groups.findMany({
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },

  async findByPagination(limit: number, offset: number, descending?: boolean) {
    return prisma.groups.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },

  async findById(id: string) {
    return prisma.groups.findUnique({ where: { id } });
  },

  async findByIdWithMembers(id: string) {
    return prisma.groups.findUnique({
      where: { id },
      include: { members: true },
    });
  },

  async findByOwner(ownerId: string, descending?: boolean) {
    return prisma.groups.findMany({
      where: { ownerId },
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },

  async findByMember(userId: string, descending?: boolean) {
    return prisma.groups.findMany({
      where: { members: { some: { id: userId } } },
      orderBy: { createdAt: descending ? "desc" : "asc" },
    });
  },

  async update(id: string, data: Partial<{ title: string; ownerId: string }>) {
    return prisma.groups.update({ where: { id }, data });
  },

  async addMember(groupId: string, userId: string) {
    return prisma.groups.update({
      where: { id: groupId },
      data: { members: { connect: { id: userId } } },
      include: { members: true },
    });
  },

  async removeMember(groupId: string, userId: string) {
    return prisma.groups.update({
      where: { id: groupId },
      data: { members: { disconnect: { id: userId } } },
      include: { members: true },
    });
  },

  async delete(id: string) {
    return prisma.groups.delete({ where: { id } });
  },

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const group = await prisma.groups.findFirst({
      where: { id: groupId, members: { some: { id: userId } } },
    });
    return !!group;
  },

  async isOwner(groupId: string, userId: string): Promise<boolean> {
    const group = await prisma.groups.findFirst({
      where: { id: groupId, ownerId: userId },
    });
    return !!group;
  },
};
