import { prisma } from "../../config/database";

export const authRepository = {
  async createSession(data: {
    sessionId: string;
    userId: string;
    expiryDate?: Date;
    isExpired: boolean;
  }) {
    prisma.sessions.create({ data });
  },
  async createToken(data: {
    tokenId: string;
    userId?: string;
    groupId?: string;
    expiryDate?: Date;
    isExpired: boolean;
  }) {
    prisma.tokens.create({ data });
  },
  async findAllSessions() {
    return prisma.sessions.findMany();
  },
  async findAllTokens() {
    return prisma.tokens.findMany();
  },
  async findSessionById(sessionId: string) {
    return prisma.sessions.findUnique({ where: { sessionId } });
  },
  async findSessionsByUserId(userId: string) {
    return prisma.sessions.findMany({ where: { userId } });
  },
  async findTokenById(tokenId: string) {
    return prisma.tokens.findUnique({ where: { tokenId } });
  },
  async findTokensByUserId(userId: string) {
    return prisma.tokens.findMany({ where: { userId } });
  },
  async findTokensByGroupId(groupId: string) {
    return prisma.tokens.findMany({ where: { groupId } });
  },
  async updateSessionExpiry(
    sessionId: string,
    data: Partial<{ isExpired: boolean; expiryDate: Date }>,
  ) {
    return prisma.sessions.update({ where: { sessionId }, data });
  },
  async updateTokenExpiry(
    tokenId: string,
    data: Partial<{ isExpired: boolean; expiryDate: Date }>,
  ) {
    return prisma.tokens.update({ where: { tokenId }, data });
  },
};
