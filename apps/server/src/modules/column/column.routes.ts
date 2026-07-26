import { Router } from "express";
import { columnController } from "./column.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { requireColumnOwner } from "../../middleware/column.middleware";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", columnController.getAllColumns);
router.get("/board/:boardId", columnController.getColumnsByBoardId);
router.post("/", columnController.createColumn);
router.get("/:id", requireColumnOwner, columnController.getColumnById);
router.patch("/:id", requireColumnOwner, columnController.updateColumn);
router.delete("/:id", requireColumnOwner, columnController.deleteColumn);
router.patch("/reorder/:boardId", columnController.reorderColumns);

export default router;
