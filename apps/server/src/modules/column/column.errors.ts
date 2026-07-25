import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class ColumnNotFound extends AppError {
  constructor(columnId: string) {
    super(`Column with id ${columnId} not found!`, 404, true, ErrorCode.COLUMN_NOT_FOUND);
  }
}
