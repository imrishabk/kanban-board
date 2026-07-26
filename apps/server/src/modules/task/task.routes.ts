import { Router } from "express";
import { taskController } from "./task.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { requireTaskOwner } from "../../middleware/task.middleware";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);

router.get("/column/:columnId", taskController.getTasksByColumnId);
router.post("/column/:columnId/reorder", taskController.reorderTasks);

router.get("/:id", taskController.getTaskById);
router.patch("/:id", requireTaskOwner, taskController.updateTask);
router.patch("/:id/move", requireTaskOwner, taskController.moveTask);
router.delete("/:id", requireTaskOwner, taskController.deleteTask);

// Labels
router.get("/labels", taskController.getLabels);
router.post("/labels", taskController.createLabel);
router.patch("/labels/:id", taskController.updateLabel);
router.delete("/labels/:id", taskController.deleteLabel);
router.post("/:id/labels", requireTaskOwner, taskController.addLabelsToTask);
router.delete("/:id/labels/:labelId", requireTaskOwner, taskController.removeLabelFromTask);

// Comments
router.get("/:id/comments", taskController.getComments);
router.post("/:id/comments", taskController.addComment);
router.patch("/comments/:id", taskController.updateComment);
router.delete("/comments/:id", taskController.deleteComment);

export default router;
