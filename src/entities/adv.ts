import { z } from 'zod';

// Enum types
export const AdvTypeSchema = z.enum(['banner', 'popup', 'sidebar', 'newsletter']);
export const AdvPositionSchema = z.enum(['home', 'article', 'category', 'tag', 'search']);

export const AdvSchema = z.object({
  _id: z.string().optional(), // ObjectId come string
  author_id: z.string(), // ObjectId reference to Author
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).optional(),
  description: z.string().optional(),
  image: z.string().optional(), // PRIMA IMPLEMENTAZIONE: String (URL) - FUTURO: SizedImage
  link: z.string().url().optional(),
  type: AdvTypeSchema.optional(),
  position: AdvPositionSchema.optional(),
  priority: z.number().min(0).max(10).optional(),
  impressions: z.number().min(0).optional().default(0),
  clicks: z.number().min(0).optional().default(0),
  published: z.boolean().default(false),
  published_date: z.date().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const CreateAdvSchema = AdvSchema.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateAdvSchema = CreateAdvSchema.partial();

export type Adv = z.infer<typeof AdvSchema>;
export type AdvType = z.infer<typeof AdvTypeSchema>;
export type AdvPosition = z.infer<typeof AdvPositionSchema>;
export type CreateAdv = z.infer<typeof CreateAdvSchema>;
export type UpdateAdv = z.infer<typeof UpdateAdvSchema>;
