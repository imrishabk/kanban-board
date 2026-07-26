import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { userService } from "../user/user.service";
import { authService } from "./auth.service";
import { validateRequest } from "../../middleware/validateRequest";
import { registerSchema, loginSchema } from "./auth.validations";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getSessionExpiry(rememberMe: boolean): Date {
  return new Date(Date.now() + (rememberMe ? THIRTY_DAYS_MS : SEVEN_DAYS_MS));
}

function setSessionCookie(res: Response, sessionId: string, rememberMe: boolean) {
  const maxAge = rememberMe ? THIRTY_DAYS_MS : SEVEN_DAYS_MS;
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

export const authController = {
  register: [
    validateRequest(registerSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { username, email, password, displayName } = req.body;
      const user = await userService.createUser(username, email, password, displayName);
      res.status(201).json({
        success: true,
        data: { user: sanitizeUser(user) },
        message: "Registration successful. Please login.",
      });
    }),
  ],

  login: [
    validateRequest(loginSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { login, password, rememberMe } = req.body;
      await authService.validateLogin(login, password);

      const trimmedLogin = login.trim();
      const isEmail = trimmedLogin.includes("@");
      const user = isEmail
        ? await userService.getUserByEmail(trimmedLogin)
        : await userService.getUserByUsername(trimmedLogin);

      const expiryDate = getSessionExpiry(rememberMe ?? false);
      const session = await authService.createSession(user!.id, expiryDate);
      setSessionCookie(res, session.sessionId, rememberMe ?? false);

      res.json({
        success: true,
        data: { user: sanitizeUser(user) },
      });
    }),
  ],

  logout: asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await authService.expireSession(sessionId);
    }
    clearSessionCookie(res);
    res.json({ success: true, message: "Logged out successfully" });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      res
        .status(401)
        .json({ success: false, error: { code: "NO_SESSION", message: "No active session" } });
      return;
    }

    const session = await authService.updateSessionExpiryTime(sessionId, getSessionExpiry(false));
    setSessionCookie(res, session.sessionId, false);

    res.json({ success: true, message: "Session refreshed" });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({ success: true, data: { user: sanitizeUser(user) } });
  }),
};
