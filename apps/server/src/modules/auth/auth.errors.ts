import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class SessionNotFound extends AppError {
  constructor(sessionId: string) {
    super(`Session with id ${sessionId} not found!`, 404, true, ErrorCode.SESSION_NOT_FOUND);
  }
}

export class TokenNotFound extends AppError {
  constructor(tokenId: string) {
    super(`Token with id ${tokenId} not found!`, 404, true, ErrorCode.TOKEN_NOT_FOUND);
  }
}

export class InvalidCredential extends AppError {
  constructor() {
    super(`Invalid Session!`, 403, true, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class CredentialExpired extends AppError {
  constructor() {
    super(`Credential have expired!`, 401, true, ErrorCode.CREDENTIAL_EXPIRED);
  }
}

export class InvalidUser extends AppError {
  constructor() {
    super(`Invalid User!`, 403, true, ErrorCode.USER_NOT_FOUND);
  }
}

export class InvalidExpiryDate extends AppError {
  constructor() {
    super(`Invalid expiry date!`, 403, true, ErrorCode.INVALID_EXPIRY_DATE);
  }
}
