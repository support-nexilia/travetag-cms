import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const CronJobStatusSchema = z.enum([
  'pending',
  'running',
  'failed',
  'cancelled',
]);

export const CronJobTypeSchema = z.enum([
  'publish_post',
  'publish_adv',
  'send_notification',
]);

export const CronJobSchema = z.object({
  _id: z.instanceof(ObjectId),
  jobKey: z.string().optional(),
  jobType: CronJobTypeSchema,
  status: CronJobStatusSchema,
  priority: z.number().min(1).max(10).default(5),
  scheduledFor: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  maxRetries: z.number().default(3),
  retryCount: z.number().default(0),
  retryDelayMs: z.number().default(5000),
  nextRetryAt: z.date().optional(),
  payload: z.unknown(),
  result: z.unknown().optional(),
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    timestamp: z.date(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCronJobSchema = z.object({
  jobKey: z.string().optional(),
  jobType: CronJobTypeSchema,
  scheduledFor: z.date().optional(),
  priority: z.number().min(1).max(10).default(5),
  maxRetries: z.number().default(3),
  retryDelayMs: z.number().default(5000),
  payload: z.unknown(),
});

export type CronJob = z.infer<typeof CronJobSchema>;
export type CreateCronJob = z.infer<typeof CreateCronJobSchema>;
export type CronJobType = z.infer<typeof CronJobTypeSchema>;
export type CronJobStatus = z.infer<typeof CronJobStatusSchema>;
