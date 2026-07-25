import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class BoardNotFound extends AppError {
  constructor(boardId: string) {
    super(`Board with id ${boardId} not found!`, 404, true, ErrorCode.BOARD_NOT_FOUND);
  }
}

export class BoardAccessDenied extends AppError {
  constructor() {
    super(`You do not have access to this board!`, 403, true, ErrorCode.BOARD_ACCESS_DENIED);
  }
}
