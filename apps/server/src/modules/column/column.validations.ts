import { z } from "zod";

export const createColumnSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    boardId: z.string().cuid(),
  }),
});

export const updateColumnSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
  }),
});

export const columnIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const boardIdParamSchema = z.object({
  params: z.object({
    boardId: z.string().cuid(),
  }),
});

export const reorderColumnsSchema = z.object({
  params: z.object({
    boardId: z.string().cuid(),
  }),
  body: z.object({
    columns: z
      .array(
        z.object({
          id: z.string().cuid(),
          position: z.number().int().min(0),
        }),
      )
      .min(1),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});
