import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { CronJobHandler } from './index';

export const publishPostHandler: CronJobHandler = async (job) => {
  const payload = job.payload as { articleId?: string };
  const articleId = payload?.articleId;

  if (!articleId || !ObjectId.isValid(articleId)) {
    throw new Error('Invalid articleId');
  }

  const now = new Date();
  const result = await collections.articles.updateOne(
    { _id: new ObjectId(articleId) },
    {
      $set: {
        published: true,
        updated_at: now,
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Article not found');
  }

  return { updated: result.modifiedCount };
};
