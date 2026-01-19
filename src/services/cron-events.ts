import { eventEmitter } from '@/services/events';
import { deleteJobByKey, upsertJobByKey } from '@/data/cron-jobs';

let isRegistered = false;

type ArticleScheduledPayload = {
  articleId: string;
  published: boolean;
  publishedDate: Date;
  status?: 'DRAFT' | 'PUBLISHED';
};

async function scheduleArticlePublishJob(payload: ArticleScheduledPayload) {
  const now = new Date();
  const shouldPublish = payload.status
    ? payload.status === 'PUBLISHED'
    : payload.published;
  const jobKey = `publish_post:article:${payload.articleId}`;

  if (!shouldPublish || payload.publishedDate <= now) {
    await deleteJobByKey(jobKey);
    return;
  }

  await upsertJobByKey(jobKey, 'publish_post', {
    scheduledFor: payload.publishedDate,
    priority: 5,
    payload: { articleId: payload.articleId },
  });
}

export function registerCronEventListeners() {
  if (isRegistered) {
    return;
  }
  isRegistered = true;

  eventEmitter.removeAllListeners('article:created');
  eventEmitter.removeAllListeners('article:updated');
  eventEmitter.removeAllListeners('article:deleted');

  eventEmitter.on('article:created', async (payload: ArticleScheduledPayload) => {
    try {
      await scheduleArticlePublishJob(payload);
    } catch (error) {
      console.error('[cron-events] Failed to schedule article publish job:', error);
    }
  });

  eventEmitter.on('article:updated', async (payload: ArticleScheduledPayload) => {
    try {
      await scheduleArticlePublishJob(payload);
    } catch (error) {
      console.error('[cron-events] Failed to reschedule article publish job:', error);
    }
  });

  eventEmitter.on('article:deleted', async ({ articleId }: { articleId: string }) => {
    try {
      await deleteJobByKey(`publish_post:article:${articleId}`);
    } catch (error) {
      console.error('[cron-events] Failed to remove article publish job:', error);
    }
  });
}
