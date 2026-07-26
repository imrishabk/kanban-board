import { Router } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { authRateLimiter } from "../../middleware/rateLimiter";
import { logoutSchema, refreshSchema, meSchema } from "./auth.validations";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

// Public routes with rate limiting
router.post("/register", authRateLimiter, ...authController.register);
router.post("/login", authRateLimiter, ...authController.login);

// Protected routes
router.post(
  "/logout",
  authMiddleware.authenticate,
  validateRequest(logoutSchema),
  authController.logout,
);
router.post(
  "/refresh",
  authMiddleware.authenticate,
  validateRequest(refreshSchema),
  authController.refresh,
);
router.get("/me", authMiddleware.authenticate, validateRequest(meSchema), authController.me);

export default router;
