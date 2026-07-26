import { Router } from "express";
import { boardController } from "./board.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { requireBoardOwner } from "../../middleware/board.middleware";

const router = Router();

router.use(authMiddleware.authenticate);

// User's boards
router.get("/", boardController.getAllBoards);
router.get("/mine", boardController.getBoardsByOwner);
router.post("/", boardController.createBoard);

// Board by ID
router.get("/:id", requireBoardOwner, boardController.getBoardById);
router.patch("/:id", requireBoardOwner, boardController.updateBoard);
router.delete("/:id", requireBoardOwner, boardController.deleteBoard);

// Transfer ownership
router.patch("/:id/transfer", requireBoardOwner, boardController.transferOwnership);

export default router;
