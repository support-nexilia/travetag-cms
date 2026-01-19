import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { CronJobHandler } from './index';

export const publishAdvHandler: CronJobHandler = async (job) => {
  const payload = job.payload as { advId?: string };
  const advId = payload?.advId;

  if (!advId || !ObjectId.isValid(advId)) {
    throw new Error('Invalid advId');
  }

  const now = new Date();
  const result = await collections.db.collection('advs').updateOne(
    { _id: new ObjectId(advId) },
    {
      $set: {
        published: true,
        published_date: now,
        updated_at: now,
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Adv not found');
  }

  return { updated: result.modifiedCount };
};
