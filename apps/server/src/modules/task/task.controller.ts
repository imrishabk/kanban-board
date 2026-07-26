import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { taskService } from "./task.service";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  reorderTasksSchema,
  taskIdParamSchema,
  columnIdParamSchema,
  paginationSchema,
  createLabelSchema,
  updateLabelSchema,
  labelIdParamSchema,
  addLabelsToTaskSchema,
  removeLabelFromTaskSchema,
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
} from "./task.validations";

export const taskController = {
  createTask: [
    validateRequest(createTaskSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { name, columnId, description, position, assigneeId, dueDate, labelIds } = req.body;
      const userId = (req as any).user!.id;
      const task = await taskService.createTask(
        name,
        columnId,
        userId,
        description,
        position,
        assigneeId,
        dueDate,
        labelIds,
      );
      res.status(201).json({ success: true, data: task });
    }),
  ],

  getTaskById: [
    validateRequest(taskIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const task = await taskService.getTaskById(id);
      res.json({ success: true, data: task });
    }),
  ],

  getAllTasks: [
    validateRequest(paginationSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, offset, columnId, assigneeId, dueDateBefore, dueDateAfter, labelId } =
        req.query as any;
      const userId = (req as any).user!.id;
      const tasks = await taskService.getFilteredTasks(userId, {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        columnId,
        assigneeId,
        dueDateBefore: dueDateBefore ? new Date(dueDateBefore) : undefined,
        dueDateAfter: dueDateAfter ? new Date(dueDateAfter) : undefined,
        labelId,
      });
      res.json({ success: true, data: tasks });
    }),
  ],

  getTasksByColumnId: [
    validateRequest(columnIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { columnId } = req.params as { columnId: string };
      const userId = (req as any).user!.id;
      const tasks = await taskService.getTasksByColumnId(columnId, userId);
      res.json({ success: true, data: tasks });
    }),
  ],

  updateTask: [
    validateRequest(updateTaskSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const data = req.body;
      const task = await taskService.updateTask(id, userId, data);
      res.json({ success: true, data: task });
    }),
  ],

  moveTask: [
    validateRequest(moveTaskSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const { columnId, position } = req.body;
      const task = await taskService.moveTask(id, userId, columnId, position);
      res.json({ success: true, data: task });
    }),
  ],

  reorderTasks: [
    validateRequest(reorderTasksSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { columnId } = req.params as { columnId: string };
      const userId = (req as any).user!.id;
      const { tasks } = req.body;
      const tasksData = await taskService.reorderTasks(columnId, userId, tasks);
      res.json({ success: true, data: tasksData });
    }),
  ],

  deleteTask: [
    validateRequest(taskIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      await taskService.deleteTask(id, userId);
      res.json({ success: true, message: "Task deleted successfully" });
    }),
  ],

  // Labels
  createLabel: [
    validateRequest(createLabelSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { name, boardId } = req.body;
      const userId = (req as any).user!.id;
      const label = await taskService.createLabel(name, boardId, userId);
      res.status(201).json({ success: true, data: label });
    }),
  ],

  getLabels: [
    asyncHandler(async (req: Request, res: Response) => {
      const { boardId } = req.query;
      const userId = (req as any).user!.id;
      const labels = await taskService.getLabels(boardId as string | undefined, userId);
      res.json({ success: true, data: labels });
    }),
  ],

  updateLabel: [
    validateRequest(updateLabelSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const data = req.body;
      const label = await taskService.updateLabel(id, userId, data);
      res.json({ success: true, data: label });
    }),
  ],

  deleteLabel: [
    validateRequest(labelIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      await taskService.deleteLabel(id, userId);
      res.json({ success: true, message: "Label deleted successfully" });
    }),
  ],

  addLabelsToTask: [
    validateRequest(addLabelsToTaskSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const { labelIds } = req.body;
      await taskService.addLabelsToTask(id, userId, labelIds);
      res.json({ success: true, message: "Labels added successfully" });
    }),
  ],

  removeLabelFromTask: [
    validateRequest(removeLabelFromTaskSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id, labelId } = req.params as { id: string; labelId: string };
      const userId = (req as any).user!.id;
      await taskService.removeLabelFromTask(id, userId, labelId);
      res.json({ success: true, message: "Label removed successfully" });
    }),
  ],

  // Comments
  getComments: [
    validateRequest(taskIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const comments = await taskService.getComments(id, userId);
      res.json({ success: true, data: comments });
    }),
  ],

  addComment: [
    validateRequest(createCommentSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const { content } = req.body;
      const comment = await taskService.createComment(id, userId, content);
      res.status(201).json({ success: true, data: comment });
    }),
  ],

  updateComment: [
    validateRequest(updateCommentSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      const { content } = req.body;
      const comment = await taskService.updateComment(id, userId, content);
      res.json({ success: true, data: comment });
    }),
  ],

  deleteComment: [
    validateRequest(commentIdParamSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).user!.id;
      await taskService.deleteComment(id, userId);
      res.json({ success: true, message: "Comment deleted successfully" });
    }),
  ],
};
