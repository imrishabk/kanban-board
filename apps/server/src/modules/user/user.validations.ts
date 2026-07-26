import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    displayName: z.string().min(1).max(100),
    role: z.enum(["USER", "ADMIN"]).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
    email: z.string().email().optional(),
    displayName: z.string().min(1).max(100).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const updateOwnUserSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/)
        .optional(),
      email: z.string().email().optional(),
      displayName: z.string().min(1).max(100).optional(),
      currentPassword: z.string().min(1).optional(),
      newPassword: z.string().min(8).max(128).optional(),
    })
    .refine(
      (data) => {
        if (data.newPassword && !data.currentPassword) {
          return false;
        }
        return true;
      },
      {
        message: "Current password required when changing password",
        path: ["currentPassword"],
      },
    ),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const usernameParamSchema = z.object({
  params: z.object({
    username: z.string().min(1).max(30),
  }),
});

export const emailParamSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});

export const activateUserSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const deactivateUserSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});
