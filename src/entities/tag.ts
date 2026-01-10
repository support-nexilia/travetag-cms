import { z } from 'zod';

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TagCreateSchema = TagSchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTagSchema = TagSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
