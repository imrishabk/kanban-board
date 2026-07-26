import { AppError } from "../../common/errors/AppError";
import { ErrorCode } from "../../common/errors/errorCodes";
import { DuplicateEmail, DuplicateUsername, UserNotFound, InvalidCredentials } from "./user.errors";
import { userRepository } from "./user.repository";
import { userUtil } from "./user.util";
import { Role } from "../../generated/prisma/client";

export const userService = {
  async createUser(
    username: string,
    email: string,
    password: string,
    displayName: string,
    role?: Role,
  ) {
    if (!username || username.trim().length === 0) {
      throw new AppError("Username is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!email || email.trim().length === 0) {
      throw new AppError("Email is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!password || password.length === 0) {
      throw new AppError("Password is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new AppError("Display name is required!", 400, true, ErrorCode.MISSING_FIELD);
    }

    const existingEmail = await userRepository.findByEmail(email.trim());
    if (existingEmail) {
      throw new DuplicateEmail(email.trim());
    }

    const existingUsername = await userRepository.findByUsername(username.trim());
    if (existingUsername) {
      throw new DuplicateUsername(username.trim());
    }

    const hashedPassword = await userUtil.hashPassword(password);
    const user = await userRepository.create({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      displayName: displayName.trim(),
      isActive: true,
      role,
    });
    return user;
  },

  async getUserById(id: string) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const user = await userRepository.findById(id);
    if (!user) {
      throw new UserNotFound(`with id ${id}`);
    }
    return user;
  },

  async getAllUsers(limit?: number, offset?: number) {
    if (limit !== undefined && offset !== undefined) {
      return userRepository.findByPagination(limit, offset, true);
    }
    return userRepository.findAll(true);
  },

  async getUserByUsername(username: string) {
    if (!username) {
      throw new AppError("Username is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new UserNotFound(`with username ${username}`);
    }
    return user;
  },

  async getUserByEmail(email: string) {
    if (!email) {
      throw new AppError("Email is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFound(`with email ${email}`);
    }
    return user;
  },

  async updateUser(
    id: string,
    data: {
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
      role?: Role;
    },
  ) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new UserNotFound(`with id ${id}`);
    }

    if (data.email !== undefined && data.email.trim().length === 0) {
      throw new AppError("Email cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    if (data.username !== undefined && data.username.trim().length === 0) {
      throw new AppError("Username cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    if (data.displayName !== undefined && data.displayName.trim().length === 0) {
      throw new AppError("Display name cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    if (data.password !== undefined && data.password.length === 0) {
      throw new AppError("Password cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    if (data.email !== undefined && data.email.trim() !== existing.email) {
      const duplicateEmail = await userRepository.findByEmail(data.email.trim());
      if (duplicateEmail) {
        throw new DuplicateEmail(data.email.trim());
      }
    }
    if (data.username !== undefined && data.username.trim() !== existing.username) {
      const duplicateUsername = await userRepository.findByUsername(data.username.trim());
      if (duplicateUsername) {
        throw new DuplicateUsername(data.username.trim());
      }
    }

    const updateData: {
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
      role?: Role;
    } = {};
    if (data.username !== undefined) updateData.username = data.username.trim();
    if (data.email !== undefined) updateData.email = data.email.trim();
    if (data.displayName !== undefined) updateData.displayName = data.displayName.trim();
    if (data.password !== undefined)
      updateData.password = await userUtil.hashPassword(data.password);
    if (data.role !== undefined) updateData.role = data.role;

    return userRepository.update(id, updateData);
  },

  async updateUserWithPasswordCheck(
    id: string,
    data: {
      username?: string;
      email?: string;
      displayName?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new UserNotFound(`with id ${id}`);
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError(
          "Current password is required to change password!",
          400,
          true,
          ErrorCode.VALIDATION_FAILED,
        );
      }
      const valid = await userUtil.validateHash(existing.password, data.currentPassword);
      if (!valid) {
        throw new InvalidCredentials();
      }
    }

    if (data.email !== undefined && data.email.trim().length === 0) {
      throw new AppError("Email cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    if (data.username !== undefined && data.username.trim().length === 0) {
      throw new AppError("Username cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }
    if (data.displayName !== undefined && data.displayName.trim().length === 0) {
      throw new AppError("Display name cannot be empty!", 400, true, ErrorCode.VALIDATION_FAILED);
    }

    if (data.email !== undefined && data.email.trim() !== existing.email) {
      const duplicateEmail = await userRepository.findByEmail(data.email.trim());
      if (duplicateEmail) {
        throw new DuplicateEmail(data.email.trim());
      }
    }
    if (data.username !== undefined && data.username.trim() !== existing.username) {
      const duplicateUsername = await userRepository.findByUsername(data.username.trim());
      if (duplicateUsername) {
        throw new DuplicateUsername(data.username.trim());
      }
    }

    const updateData: {
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
    } = {};
    if (data.username !== undefined) updateData.username = data.username.trim();
    if (data.email !== undefined) updateData.email = data.email.trim();
    if (data.displayName !== undefined) updateData.displayName = data.displayName.trim();
    if (data.newPassword !== undefined)
      updateData.password = await userUtil.hashPassword(data.newPassword);

    return userRepository.update(id, updateData);
  },

  async deleteUser(id: string) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new UserNotFound(`with id ${id}`);
    }
    return userRepository.delete(id);
  },

  async activateUser(id: string) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new UserNotFound(`with id ${id}`);
    }
    return userRepository.activate(id);
  },

  async deactivateUser(id: string) {
    if (!id) {
      throw new AppError("User id is required!", 400, true, ErrorCode.MISSING_FIELD);
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new UserNotFound(`with id ${id}`);
    }
    return userRepository.deactivate(id);
  },
};
