import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class TaskNotFound extends AppError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found!`, 404, true, ErrorCode.TASK_NOT_FOUND);
  }
}
