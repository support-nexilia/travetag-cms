import { z } from 'zod';

export const AdvStatusSchema = z.enum(['PUBLISHED', 'DELETED', 'DRAFT', 'PLANNED']);

export const AdvSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255),
  link: z.string().url(),
  date: z.date(),
  status: AdvStatusSchema,
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAdvSchema = AdvSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateAdvSchema = CreateAdvSchema.partial();

export type Adv = z.infer<typeof AdvSchema>;
export type AdvStatus = z.infer<typeof AdvStatusSchema>;
export type CreateAdv = z.infer<typeof CreateAdvSchema>;
export type UpdateAdv = z.infer<typeof UpdateAdvSchema>;
