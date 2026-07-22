import express, { type Express, type Request, type Response } from "express";
import dotenv, { type DotenvConfigOutput } from "dotenv";

const result: DotenvConfigOutput = dotenv.config();
if (result.error) {
  console.error(`Failed to load .env file: ${result.error}`);
  process.exit(1);
}

const port: number = parseInt(process.env.PORT ?? "3000", 10);
if (!isNaN(port)) {
  console.error(`Invalid port number: ${port}`);
  process.exit(1);
}

const app: Express = express();

app.get("/", (_req: Request, res: Response) => {
  res.send(`This is Kanban-Board API for backend server.`);
});

app.listen(port, () => {
  console.log(`Started Kanban-Board server at ${port}`);
});
