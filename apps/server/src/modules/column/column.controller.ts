import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { columnService } from "./column.service";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createColumnSchema,
  updateColumnSchema,
  columnIdParamSchema,
  boardIdParamSchema,
  paginationSchema,
  reorderColumnsSchema,
} from "./column.validations";

export const columnController = {
  createColumn: [
    validateRequest(createColumnSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { title, boardId } = req.body;
      const userId = (req as any).user!.id;
      const column = await columnService.createColumn(title, boardId, userId);
      res.status(201).json({ success: true, data: column });
    }),
  ],

  getColumnById: [
    validateRequest(columnIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const column = await columnService.getColumnById(id);
      res.json({ success: true, data: column });
    }),
  ],

  getAllColumns: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, offset } = req.query as { limit?: string; offset?: string };
      const columns = await columnService.getAllColumns(
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      );
      res.json({ success: true, data: columns });
    }),
  ],

  getColumnsByBoardId: [
    validateRequest(boardIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { boardId } = req.params as { boardId: string };
      const userId = (req as any).user!.id;
      const columns = await columnService.getColumnsByBoardId(boardId, userId);
      res.json({ success: true, data: columns });
    }),
  ],

  updateColumn: [
    validateRequest(updateColumnSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const data = req.body;
      const column = await columnService.updateColumn(id, userId, data);
      res.json({ success: true, data: column });
    }),
  ],

  deleteColumn: [
    validateRequest(columnIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      await columnService.deleteColumn(id, userId);
      res.json({ success: true, message: "Column deleted successfully" });
    }),
  ],

  reorderColumns: [
    validateRequest(reorderColumnsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { boardId } = req.params as { boardId: string };
      const userId = (req as any).user!.id;
      const { columns } = req.body;
      const updatedColumns = await columnService.reorderColumns(boardId, userId, columns);
      res.json({ success: true, data: updatedColumns });
    }),
  ],
};
