import type { Request, Response, NextFunction } from "express";
import { authRepository } from "./auth.repository";
import { authUtil } from "./auth.util";
import type { Sessions, Tokens } from "../../generated/prisma/client";

type AuthResult = { kind: "session"; record: Sessions } | { kind: "token"; record: Tokens } | null;

function isRecordExpired(record: { isExpired: boolean; expiryDate: Date | null }): boolean {
  if (record.isExpired) return true;
  if (record.expiryDate === null) return false;
  return record.expiryDate.getTime() < Date.now();
}

async function resolveAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const rawToken = authHeader.split(" ")[1];
    const record = await authRepository.findTokenById(authUtil.hashToken(rawToken));
    return record ? { kind: "token", record } : null;
  }

  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    const record = await authRepository.findSessionById(sessionId);
    return record ? { kind: "session", record } : null;
  }

  return null;
}

export const authMiddleware = {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const auth = await resolveAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "No valid credentials provided!" });
    }
    const { kind, record } = auth;
    if (isRecordExpired(record)) {
      if (kind === "session") {
        await authRepository.updateSessionExpiry(record.sessionId, { isExpired: true });
      } else {
        await authRepository.updateTokenExpiry(record.tokenId, { isExpired: true });
      }
      return res.status(401).json({ error: "Credentials have expired!" });
    }
    next();
  },
};
