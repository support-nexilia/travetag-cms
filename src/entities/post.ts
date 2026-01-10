import { z } from 'zod';

export const PostStatusSchema = z.enum(['PUBLISHED', 'DELETED', 'REVISION', 'DRAFT', 'PLANNED']);

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  date: z.date(),
  status: PostStatusSchema,
  parentId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePostSchema = PostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true, // Generated automatically
}).extend({
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const UpdatePostSchema = PostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
}).partial();

export type Post = z.infer<typeof PostSchema>;
export type PostStatus = z.infer<typeof PostStatusSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
