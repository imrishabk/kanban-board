import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { userService } from "./user.service";
import { userUtil } from "./user.util";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createUserSchema,
  updateUserSchema,
  updateOwnUserSchema,
  userIdParamSchema,
  usernameParamSchema,
  emailParamSchema,
  activateUserSchema,
  deactivateUserSchema,
  paginationSchema,
} from "./user.validations";

function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

export const userController = {
  createUser: [
    validateRequest(createUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { username, email, password, displayName, role } = req.body;
      const user = await userService.createUser(username, email, password, displayName, role);
      res.status(201).json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  getAllUsers: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, offset } = req.query;
      const users = await userService.getAllUsers(
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: users.map(sanitizeUser) });
    }),
  ],

  getUserById: [
    validateRequest(userIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const user = await userService.getUserById(id);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  getUserByUsername: [
    validateRequest(usernameParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { username } = req.params as { username: string };
      const user = await userService.getUserByUsername(username);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  getUserByEmail: [
    validateRequest(emailParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { email } = req.params as { email: string };
      const user = await userService.getUserByEmail(email);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  updateUser: [
    validateRequest(updateUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const data = req.body;
      const user = await userService.updateUser(id, data);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  updateOwnProfile: [
    validateRequest(updateOwnUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const userId = (req as any).user!.id;
      const { username, email, displayName, currentPassword, newPassword } = req.body;

      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (displayName !== undefined) updateData.displayName = displayName;

      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            error: { code: "VALIDATION_FAILED", message: "Current password required" },
          });
          return;
        }
        const user = await userService.getUserById(userId);
        const valid = await userUtil.validateHash(user.password, currentPassword);
        if (!valid) {
          res.status(401).json({
            success: false,
            error: { code: "INVALID_CREDENTIALS", message: "Current password incorrect" },
          });
          return;
        }
        updateData.password = newPassword;
      }

      const user = await userService.updateUserWithPasswordCheck(userId, updateData);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  deleteUser: [
    validateRequest(userIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      await userService.deleteUser(id);
      res.json({ success: true, message: "User deleted successfully" });
    }),
  ],

  activateUser: [
    validateRequest(activateUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const user = await userService.activateUser(id);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],

  deactivateUser: [
    validateRequest(deactivateUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const user = await userService.deactivateUser(id);
      res.json({ success: true, data: sanitizeUser(user) });
    }),
  ],
};
