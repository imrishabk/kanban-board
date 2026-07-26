import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";

export class GroupNotFound extends AppError {
  constructor(groupId: string) {
    super(`Group with id ${groupId} not found!`, 404, true, ErrorCode.GROUP_NOT_FOUND);
  }
}

export class GroupAccessDenied extends AppError {
  constructor() {
    super(`You do not have access to this group!`, 403, true, ErrorCode.GROUP_ACCESS_DENIED);
  }
}

export class UserNotGroupMember extends AppError {
  constructor() {
    super(`User is not a member of this group!`, 403, true, ErrorCode.USER_NOT_GROUP_MEMBER);
  }
}

export class CannotRemoveOwner extends AppError {
  constructor() {
    super(`Cannot remove group owner!`, 400, true, ErrorCode.CANNOT_REMOVE_OWNER);
  }
}
