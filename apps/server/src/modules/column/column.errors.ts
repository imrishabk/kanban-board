import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class ColumnNotFound extends AppError {
  constructor(columnId: string) {
    super(`Column with id ${columnId} not found!`, 404, true, ErrorCode.COLUMN_NOT_FOUND);
  }
}

export class ColumnAccessDenied extends AppError {
  constructor() {
    super(`You do not have access to this column!`, 403, true, ErrorCode.COLUMN_ACCESS_DENIED);
  }
}
