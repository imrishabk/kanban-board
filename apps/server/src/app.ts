import express, { type Express, type Request, type Response } from "express";
import { loadEnvironmentVariable } from "./config/env";

// This will load the environment variable
loadEnvironmentVariable();

// Initialize express application;
const app: Express = express();

// Default response to the backend api
app.get("/", (_req: Request, res: Response) => {
  res.send(`This is Kanban-Board API for backend server.`);
});

export default app;
