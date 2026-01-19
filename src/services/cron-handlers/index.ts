import type { CronJob } from '@/entities/cron-job';

export type CronJobHandler = (job: CronJob) => Promise<unknown>;

const handlers: Record<string, CronJobHandler> = {};

export function registerCronHandler(jobType: string, handler: CronJobHandler) {
  handlers[jobType] = handler;
}

export function getCronHandler(jobType: string): CronJobHandler | undefined {
  return handlers[jobType];
}

export async function executeCronJob(job: CronJob): Promise<unknown> {
  const handler = handlers[job.jobType];
  if (!handler) {
    throw new Error(`No handler registered for job type: ${job.jobType}`);
  }
  return await handler(job);
}
