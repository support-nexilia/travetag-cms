import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const CategorySchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCategorySchema = CategorySchema.omit({
  _id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCategorySchema = CategorySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
