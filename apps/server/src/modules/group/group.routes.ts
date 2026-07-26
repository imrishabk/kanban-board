import { Router } from "express";
import { groupController } from "./group.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", groupController.getAllGroups);
router.get("/mine", groupController.getGroupsByMember);
router.get("/owner/:ownerId", groupController.getGroupsByOwner);
router.get("/:id", groupController.getGroupById);

router.post("/", groupController.createGroup);
router.patch("/:id", groupController.updateGroup);
router.delete("/:id", groupController.deleteGroup);

router.post("/:id/members", groupController.addMember);
router.delete("/:id/members/:userId", groupController.removeMember);
router.patch("/:id/transfer", groupController.transferOwnership);

export default router;
