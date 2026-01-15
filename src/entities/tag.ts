import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { MediaImageSchema } from './media';

export const TagSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().max(500).optional(),
  image: MediaImageSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTagSchema = TagSchema.omit({
  _id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTagSchema = TagSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Tag = z.infer<typeof TagSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
