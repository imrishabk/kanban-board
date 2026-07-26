import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    columnId: z.string().cuid(),
    description: z.string().max(5000).optional(),
    position: z.number().int().min(0).optional(),
    assigneeId: z.string().cuid().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    labelIds: z.array(z.string().cuid()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    position: z.number().int().min(0).optional(),
    assigneeId: z.string().cuid().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    labelIds: z.array(z.string().cuid()).optional(),
  }),
});

export const moveTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    columnId: z.string().cuid(),
    position: z.number().int().min(0),
  }),
});

export const reorderTasksSchema = z.object({
  params: z.object({
    columnId: z.string().cuid(),
  }),
  body: z.object({
    tasks: z
      .array(
        z.object({
          id: z.string().cuid(),
          position: z.number().int().min(0),
        }),
      )
      .min(1),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const columnIdParamSchema = z.object({
  params: z.object({
    columnId: z.string().cuid(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    columnId: z.string().cuid().optional(),
    assigneeId: z.string().cuid().optional(),
    dueDateBefore: z.string().datetime().optional(),
    dueDateAfter: z.string().datetime().optional(),
    labelId: z.string().cuid().optional(),
  }),
});

// Labels
export const createLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    boardId: z.string().cuid(),
  }),
});

export const updateLabelSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  }),
});

export const labelIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const addLabelsToTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    labelIds: z.array(z.string().cuid()).min(1),
  }),
});

export const removeLabelFromTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
    labelId: z.string().cuid(),
  }),
});

// Comments
export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
