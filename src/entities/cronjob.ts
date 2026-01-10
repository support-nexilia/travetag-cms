import { z } from 'zod';

export const CronTaskTypeSchema = z.enum(['PUBLISH_POST', 'PUBLISH_ADV']);
export const CronStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED']);

export const CronJobSchema = z.object({
  id: z.string().uuid(),
  taskType: CronTaskTypeSchema,
  entityId: z.string().uuid(),
  scheduledAt: z.date(),
  status: CronStatusSchema,
  executedAt: z.date().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCronJobSchema = CronJobSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executedAt: true,
  errorMessage: true,
});

export const UpdateCronJobSchema = CronJobSchema.pick({
  status: true,
  executedAt: true,
  errorMessage: true,
}).partial();

export type CronJob = z.infer<typeof CronJobSchema>;
export type CronTaskType = z.infer<typeof CronTaskTypeSchema>;
export type CronStatus = z.infer<typeof CronStatusSchema>;
export type CreateCronJob = z.infer<typeof CreateCronJobSchema>;
export type UpdateCronJob = z.infer<typeof UpdateCronJobSchema>;
