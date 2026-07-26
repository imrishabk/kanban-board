import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class TaskNotFound extends AppError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found!`, 404, true, ErrorCode.TASK_NOT_FOUND);
  }
}

export class TaskAccessDenied extends AppError {
  constructor() {
    super(`You do not have access to this task!`, 403, true, ErrorCode.TASK_ACCESS_DENIED);
  }
}

export class LabelNotFound extends AppError {
  constructor(labelId: string) {
    super(`Label with id ${labelId} not found!`, 404, true, ErrorCode.LABEL_NOT_FOUND);
  }
}

export class CommentNotFound extends AppError {
  constructor(commentId: string) {
    super(`Comment with id ${commentId} not found!`, 404, true, ErrorCode.COMMENT_NOT_FOUND);
  }
}

export class NotCommentAuthor extends AppError {
  constructor() {
    super(`You can only edit or delete your own comments!`, 403, true, ErrorCode.FORBIDDEN);
  }
}
