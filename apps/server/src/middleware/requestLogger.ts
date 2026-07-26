import morgan from "morgan";
import { logger } from "../common/utils/logger";

const logFormat = "dev";

export const requestLogger = morgan(logFormat, {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
  skip: (_req) => _req.url === "/health",
});
