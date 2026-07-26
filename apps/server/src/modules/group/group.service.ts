import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import {
  GroupNotFound,
  GroupAccessDenied,
  UserNotGroupMember,
  CannotRemoveOwner,
} from "./group.errors";
import { groupRepository } from "./group.repository";

export const groupService = {
  async createGroup(title: string, ownerId: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Group title is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!ownerId) {
      throw new AppError("Owner id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const group = await groupRepository.create({ title: title.trim(), ownerId });
    // Add owner as member
    await groupRepository.addMember(group.id, ownerId);
    return groupRepository.findById(group.id);
  },

  async getGroupById(id: string) {
    if (!id) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const group = await groupRepository.findByIdWithMembers(id);
    if (!group) {
      throw new GroupNotFound(id);
    }
    return group;
  },

  async getAllGroups(limit?: number, offset?: number) {
    if (limit !== undefined && offset !== undefined) {
      return groupRepository.findByPagination(limit, offset, true);
    }
    return groupRepository.findAll(true);
  },

  async getGroupsByOwner(ownerId: string, limit?: number, offset?: number) {
    if (!ownerId) {
      throw new AppError("Owner id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (limit !== undefined && offset !== undefined) {
      return groupRepository.findByPagination(limit, offset, true);
    }
    return groupRepository.findByOwner(ownerId, true);
  },

  async getGroupsByMember(userId: string, limit?: number, offset?: number) {
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (limit !== undefined && offset !== undefined) {
      return groupRepository.findByPagination(limit, offset, true);
    }
    return groupRepository.findByMember(userId, true);
  },

  async updateGroup(id: string, userId: string, data: { title?: string }) {
    if (!id) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const isOwner = await groupRepository.isOwner(id, userId);
    if (!isOwner) {
      throw new GroupAccessDenied();
    }

    const existing = await groupRepository.findById(id);
    if (!existing) {
      throw new GroupNotFound(id);
    }

    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError("Group title cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    const updateData: { title?: string } = {};
    if (data.title !== undefined) updateData.title = data.title.trim();

    return groupRepository.update(id, updateData);
  },

  async deleteGroup(id: string, userId: string) {
    if (!id) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const isOwner = await groupRepository.isOwner(id, userId);
    if (!isOwner) {
      throw new GroupAccessDenied();
    }

    const existing = await groupRepository.findById(id);
    if (!existing) {
      throw new GroupNotFound(id);
    }

    return groupRepository.delete(id);
  },

  async addMember(groupId: string, ownerId: string, userId: string) {
    if (!groupId || !ownerId || !userId) {
      throw new AppError(
        "Group id, owner id, and user id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const isOwner = await groupRepository.isOwner(groupId, ownerId);
    if (!isOwner) {
      throw new GroupAccessDenied();
    }

    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFound(groupId);
    }

    const isMember = await groupRepository.isMember(groupId, userId);
    if (isMember) {
      throw new AppError("User is already a member!", 409, true, ErrorCode.DUPLICATE_USERNAME);
    }

    return groupRepository.addMember(groupId, userId);
  },

  async removeMember(groupId: string, ownerId: string, userId: string) {
    if (!groupId || !ownerId || !userId) {
      throw new AppError(
        "Group id, owner id, and user id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const isOwner = await groupRepository.isOwner(groupId, ownerId);
    if (!isOwner) {
      throw new GroupAccessDenied();
    }

    const group = await groupRepository.findByIdWithMembers(groupId);
    if (!group) {
      throw new GroupNotFound(groupId);
    }

    const targetMember = group.members.find((m) => m.id === userId);
    if (!targetMember) {
      throw new UserNotGroupMember();
    }

    if (group.ownerId === userId) {
      throw new CannotRemoveOwner();
    }

    return groupRepository.removeMember(groupId, userId);
  },

  async getMembers(groupId: string, userId: string) {
    if (!groupId) {
      throw new AppError("Group id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!userId) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const isMember = await groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new GroupAccessDenied();
    }

    return groupRepository.findByIdWithMembers(groupId);
  },

  async transferOwnership(groupId: string, ownerId: string, newOwnerId: string) {
    if (!groupId || !ownerId || !newOwnerId) {
      throw new AppError(
        "Group id, owner id, and new owner id are required!",
        400,
        true,
        ErrorCode.MISSING_FIELD,
      );
    }

    const isOwner = await groupRepository.isOwner(groupId, ownerId);
    if (!isOwner) {
      throw new GroupAccessDenied();
    }

    const group = await groupRepository.findByIdWithMembers(groupId);
    if (!group) {
      throw new GroupNotFound(groupId);
    }

    const newOwner = group.members.find((m) => m.id === newOwnerId);
    if (!newOwner) {
      throw new UserNotGroupMember();
    }

    if (group.ownerId === newOwnerId) {
      throw new AppError("User is already the owner!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    // Update ownerId and ensure new owner is a member
    await groupRepository.update(groupId, { ownerId: newOwnerId });
    return groupRepository.findByIdWithMembers(groupId);
  },
};
