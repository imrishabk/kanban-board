import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { boardService } from "./board.service";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
  transferBoardSchema,
  paginationSchema,
} from "./board.validations";

export const boardController = {
  createBoard: [
    validateRequest(createBoardSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { title, groupId } = req.body;
      const ownerId = (req as any).user!.id;
      const board = await boardService.createBoard(title, ownerId, groupId);
      res.status(201).json({ success: true, data: board });
    }),
  ],

  getBoardById: [
    validateRequest(boardIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const board = await boardService.getBoardById(id);
      res.json({ success: true, data: board });
    }),
  ],

  getAllBoards: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const boards = await boardService.getAllBoards(
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: boards });
    }),
  ],

  getBoardsByOwner: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const ownerId = (req as any).user!.id;
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const boards = await boardService.getBoardsByOwner(
        ownerId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: boards });
    }),
  ],

  getBoardsByGroup: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { groupId } = req.params as { groupId: string };
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const boards = await boardService.getBoardsByGroup(
        groupId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: boards });
    }),
  ],

  updateBoard: [
    validateRequest(updateBoardSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const data = req.body;
      const board = await boardService.updateBoard(id, userId, data);
      res.json({ success: true, data: board });
    }),
  ],

  transferOwnership: [
    validateRequest(transferBoardSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const currentOwnerId = (req as any).user!.id;
      const { newOwnerId } = req.body;
      const board = await boardService.transferOwnership(id, currentOwnerId, newOwnerId);
      res.json({ success: true, data: board });
    }),
  ],

  deleteBoard: [
    validateRequest(boardIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      await boardService.deleteBoard(id);
      res.json({ success: true, message: "Board deleted successfully" });
    }),
  ],
};
