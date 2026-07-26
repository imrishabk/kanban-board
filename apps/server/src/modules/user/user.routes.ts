import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { requireServerOrAdmin, requireSelfOrAdmin } from "../../middleware/role.middleware";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", requireServerOrAdmin, userController.getAllUsers);
router.get("/:id", requireSelfOrAdmin, userController.getUserById);
router.get("/username/:username", requireServerOrAdmin, userController.getUserByUsername);
router.get("/email/:email", requireServerOrAdmin, userController.getUserByEmail);

router.post("/", requireServerOrAdmin, userController.createUser);
router.patch("/:id", requireSelfOrAdmin, userController.updateUser);
router.patch("/me", userController.updateOwnProfile);
router.delete("/:id", requireSelfOrAdmin, userController.deleteUser);

router.patch("/:id/activate", requireServerOrAdmin, userController.activateUser);
router.patch("/:id/deactivate", requireServerOrAdmin, userController.deactivateUser);

export default router;
