import { type Request, type Response, type NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod";
import { AppError } from "../common/errors/AppError";
import { ErrorCode } from "../common/errors/errorCodes";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        throw new AppError(messages, 400, true, ErrorCode.VALIDATION_FAILED);
      }
      next(error);
    }
  };
};
