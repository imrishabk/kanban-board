import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class UserNotFound extends AppError {
  constructor(identifier: string) {
    super(`User ${identifier} not found!`, 404, true, ErrorCode.USER_NOT_FOUND);
  }
}

export class DuplicateEmail extends AppError {
  constructor(email: string) {
    super(`User with email ${email} already exists!`, 409, true, ErrorCode.DUPLICATE_EMAIL);
  }
}

export class DuplicateUsername extends AppError {
  constructor(username: string) {
    super(
      `User with username ${username} already exists!`,
      409,
      true,
      ErrorCode.DUPLICATE_USERNAME,
    );
  }
}
