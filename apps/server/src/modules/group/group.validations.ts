import { z } from "zod";

export const createGroupSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const groupIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().cuid(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
    userId: z.string().cuid(),
  }),
});

export const transferOwnershipSchema = z.object({
  body: z.object({
    userId: z.string().cuid(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const ownerIdParamSchema = z.object({
  params: z.object({
    ownerId: z.string().cuid(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});
