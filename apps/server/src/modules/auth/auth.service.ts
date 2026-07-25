import { userRepository } from "../user/user.repository";
import { userUtil } from "../user/user.util";
import {
  InvalidCredential,
  InvalidExpiryDate,
  InvalidUser,
  SessionNotFound,
  TokenNotFound,
} from "./auth.errors";
import { authRepository } from "./auth.repository";
import { authUtil } from "./auth.util";

export const authService = {
  async createSession(userId: string, expiryDate: Date) {
    if (!userId) {
      throw new InvalidUser();
    }
    if (expiryDate.getTime() < new Date().getTime()) {
      throw new InvalidExpiryDate();
    }
    const sessionId = authUtil.generateToken();
    const hashedSessionId = authUtil.hashToken(sessionId);
    const session = await authRepository.createSession({
      sessionId: hashedSessionId,
      userId,
      expiryDate: expiryDate,
      isExpired: false,
    });
    session.sessionId = sessionId;
    return session;
  },

  async createToken(userId?: string, groupId?: string, expiryDate?: Date) {
    const tokenId = authUtil.generateToken();
    const hashedTokenId = authUtil.hashToken(tokenId);
    const token = await authRepository.createToken({
      tokenId: hashedTokenId,
      userId,
      groupId,
      expiryDate,
      isExpired: false,
    });
    token.tokenId = tokenId;
    return token;
  },

  async updateSessionExpiryTime(sessionId: string, expiryDate: Date) {
    if (!sessionId) {
      throw new InvalidCredential();
    }
    const session = await authRepository.updateSessionExpiry(sessionId, {
      isExpired: false,
      expiryDate,
    });
    if (!session) {
      throw new SessionNotFound(sessionId);
    }
    return session;
  },

  async expireSession(sessionId: string) {
    if (!sessionId) {
      throw new Error("invalid session id");
    }
    const session = await authRepository.updateSessionExpiry(sessionId, { isExpired: true });
    if (!session) {
      throw new SessionNotFound(sessionId);
    }
    return session;
  },

  async expireToken(tokenId: string) {
    if (!tokenId) {
      throw new Error("invalid token id");
    }
    const session = await authRepository.updateTokenExpiry(tokenId, { isExpired: true });
    if (!session) {
      throw new TokenNotFound(tokenId);
    }
    return session;
  },

  async validateLogin(login: string, password: string) {
    const trimmedLogin: string = login.trim();
    const isEmail: boolean = trimmedLogin.includes("@") ? true : false;
    const user = isEmail
      ? await userRepository.findByEmail(trimmedLogin)
      : await userRepository.findByUsername(trimmedLogin);
    if (!user) {
      throw new InvalidUser();
    }
    const validPassword = await userUtil.validateHash(password, user.password);
    if (!validPassword) {
      throw new InvalidUser();
    }
    return true;
  },
};
