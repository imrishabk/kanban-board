import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    displayName: z.string().min(1).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string().min(1), // username or email
    password: z.string().min(1),
    rememberMe: z.boolean().optional(),
  }),
});

export const logoutSchema = z.object({});

export const refreshSchema = z.object({});

export const meSchema = z.object({});
