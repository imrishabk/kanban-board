import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { groupService } from "./group.service";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createGroupSchema,
  updateGroupSchema,
  groupIdParamSchema,
  addMemberSchema,
  removeMemberSchema,
  transferOwnershipSchema,
  paginationSchema,
  ownerIdParamSchema,
} from "./group.validations";

export const groupController = {
  createGroup: [
    validateRequest(createGroupSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { title } = req.body;
      const ownerId = (req as any).user!.id;
      const group = await groupService.createGroup(title, ownerId);
      res.status(201).json({ success: true, data: group });
    }),
  ],

  getGroupById: [
    validateRequest(groupIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const group = await groupService.getGroupById(id);
      res.json({ success: true, data: group });
    }),
  ],

  getAllGroups: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, offset } = req.query;
      const groups = await groupService.getAllGroups(
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: groups });
    }),
  ],

  getGroupsByOwner: [
    validateRequest(ownerIdParamSchema),
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { ownerId } = req.params as { ownerId: string };
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const groups = await groupService.getGroupsByOwner(
        ownerId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: groups });
    }),
  ],

  getGroupsByMember: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const userId = (req as any).user!.id;
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const groups = await groupService.getGroupsByMember(
        userId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: groups });
    }),
  ],

  updateGroup: [
    validateRequest(updateGroupSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const data = req.body;
      const group = await groupService.updateGroup(id, userId, data);
      res.json({ success: true, data: group });
    }),
  ],

  deleteGroup: [
    validateRequest(groupIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      await groupService.deleteGroup(id, userId);
      res.json({ success: true, message: "Group deleted successfully" });
    }),
  ],

  addMember: [
    validateRequest(addMemberSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const ownerId = (req as any).user!.id;
      const { userId } = req.body;
      const group = await groupService.addMember(id, ownerId, userId);
      res.status(201).json({ success: true, data: group });
    }),
  ],

  removeMember: [
    validateRequest(removeMemberSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id, userId } = req.params as { id: string; userId: string };
      const ownerId = (req as any).user!.id;
      const group = await groupService.removeMember(id, ownerId, userId);
      res.json({ success: true, data: group });
    }),
  ],

  transferOwnership: [
    validateRequest(transferOwnershipSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const ownerId = (req as any).user!.id;
      const { userId } = req.body;
      const group = await groupService.transferOwnership(id, ownerId, userId);
      res.json({ success: true, data: group });
    }),
  ],
};
