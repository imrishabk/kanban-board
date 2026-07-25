import type { Request, Response, NextFunction } from "express";
import { authRepository } from "./auth.repository";
import { authUtil } from "./auth.util";
import type { Sessions, Tokens } from "../../generated/prisma/client";
import { authService } from "./auth.service";
import { CredentialExpired, InvalidCredential } from "./auth.errors";

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
  async authenticate(req: Request, _res: Response, next: NextFunction) {
    const auth = await resolveAuth(req);
    if (!auth) {
      throw new InvalidCredential();
    }
    const { kind, record } = auth;
    if (isRecordExpired(record)) {
      if (kind === "session") {
        await authService.expireSession(record.sessionId);
      } else {
        await authService.expireToken(record.tokenId);
      }
      throw new CredentialExpired();
    }
    next();
  },
};
