import express, { type Express, type Request, type Response } from "express";
import { loadEnvironmentVariable } from "./config/env";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/requestLogger";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { prisma } from "./config/database";
import groupRoutes from "./modules/group/group.routes";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import boardRoutes from "./modules/board/board.routes";
import columnRoutes from "./modules/column/column.routes";
import taskRoutes from "./modules/task/task.routes";

loadEnvironmentVariable();

const app: Express = express();

// Trust proxy for rate limiter behind reverse proxy
app.set("trust proxy", 1);

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging & rate limiting
app.use(requestLogger);
app.use(rateLimiter);

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Default response to the backend api
app.get("/", (_req: Request, res: Response) => {
  res.send(`This is Kanban-Board API for backend server.`);
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/columns", columnRoutes);
app.use("/api/v1/tasks", taskRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
