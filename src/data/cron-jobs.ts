import { collections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { CreateCronJob, CronJob, CronJobStatus } from '@/entities/cron-job';

const COLLECTION_NAME = 'cron_jobs';

export async function createCronJob(data: CreateCronJob): Promise<CronJob> {
  const now = new Date();
  const job = {
    ...data,
    status: 'pending' as const,
    scheduledFor: data.scheduledFor || now,
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collections.db.collection(COLLECTION_NAME).insertOne(job);
  return { ...job, _id: result.insertedId } as CronJob;
}

export async function getNextPendingJob(): Promise<CronJob | null> {
  const now = new Date();
  const result = await collections.db.collection(COLLECTION_NAME).findOneAndUpdate(
    {
      status: 'pending',
      scheduledFor: { $lte: now },
    },
    {
      $set: {
        status: 'running',
        startedAt: now,
        updatedAt: now,
      },
    },
    {
      sort: { priority: 1, scheduledFor: 1 },
      returnDocument: 'after',
    }
  );

  const resultDoc = (result as { value?: CronJob | null } | null);
  return (resultDoc?.value ?? result ?? null) as CronJob | null;
}

export async function updateJobStatus(
  jobId: string,
  status: CronJobStatus,
  result?: unknown,
  error?: { message: string; stack?: string },
  jobKey?: string
): Promise<void> {
  const now = new Date();
  const update: Record<string, unknown> = {
    status,
    updatedAt: now,
  };

  if (status === 'failed' && error) {
    update.error = {
      ...error,
      timestamp: now,
    };
  }

  await collections.db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(jobId) },
    { $set: update }
  );
}

export async function deleteJob(jobId: string, jobKey?: string): Promise<void> {
  const isObjectId = ObjectId.isValid(jobId);
  const query = isObjectId
    ? { $or: [{ _id: new ObjectId(jobId) }, { _id: jobId }] }
    : { _id: jobId };

  await collections.db.collection(COLLECTION_NAME).deleteMany(query);
  if (jobKey) {
    await collections.db.collection(COLLECTION_NAME).deleteMany({ jobKey });
  }
}

export async function retryJob(jobId: string, delayMs?: number): Promise<void> {
  const job = await collections.db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(jobId),
  }) as CronJob | null;

  if (!job) {
    throw new Error('Job not found');
  }

  const retryDelayMs = delayMs || job.retryDelayMs;
  const nextRetryAt = new Date(Date.now() + retryDelayMs);

  if (job.retryCount >= job.maxRetries) {
    await collections.db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: 'failed',
          error: {
            message: 'Max retries exceeded',
            timestamp: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );
    return;
  }

  await collections.db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        status: 'pending',
        scheduledFor: nextRetryAt,
        nextRetryAt,
        updatedAt: new Date(),
      },
      $inc: { retryCount: 1 },
    }
  );
}

export async function cancelJob(jobId: string): Promise<void> {
  await collections.db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    }
  );
}

export async function cleanupOldJobs(daysOld = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await collections.db.collection(COLLECTION_NAME).deleteMany({
    status: { $in: ['failed', 'cancelled'] },
    createdAt: { $lt: cutoffDate },
  });

  return result.deletedCount;
}

function buildPayloadQuery(payloadMatch: Record<string, unknown>) {
  return Object.keys(payloadMatch).reduce<Record<string, unknown>>((acc, key) => {
    const value = payloadMatch[key];
    if (typeof value === 'string' && ObjectId.isValid(value)) {
      acc[`payload.${key}`] = { $in: [value, new ObjectId(value)] };
    } else {
      acc[`payload.${key}`] = value;
    }
    return acc;
  }, {});
}

export async function deletePendingJobsByPayload(
  jobType: string,
  payloadMatch: Record<string, unknown>
): Promise<number> {
  const result = await collections.db.collection(COLLECTION_NAME).deleteMany({
    status: 'pending',
    jobType,
    ...buildPayloadQuery(payloadMatch),
  });

  return result.deletedCount;
}

export async function deleteJobsByPayload(
  jobType: string,
  payloadMatch: Record<string, unknown>
): Promise<number> {
  const result = await collections.db.collection(COLLECTION_NAME).deleteMany({
    jobType,
    ...buildPayloadQuery(payloadMatch),
  });

  return result.deletedCount;
}

export async function deleteJobByKey(jobKey: string): Promise<number> {
  const result = await collections.db.collection(COLLECTION_NAME).deleteMany({
    jobKey,
  });

  return result.deletedCount;
}

export async function upsertJobByKey(
  jobKey: string,
  jobType: string,
  options: {
    scheduledFor: Date;
    priority?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    payload?: Record<string, unknown>;
  }
): Promise<CronJob> {
  const now = new Date();
  const filter = {
    jobKey,
    jobType,
  };

  const update = {
    $set: {
      jobKey,
      jobType,
      status: 'pending' as const,
      scheduledFor: options.scheduledFor,
      priority: options.priority ?? 5,
      payload: options.payload ?? {},
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      retryDelayMs: options.retryDelayMs ?? 5000,
    },
  };

  const result = await collections.db.collection(COLLECTION_NAME).findOneAndUpdate(
    filter,
    update,
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  const resultDoc = (result as { value?: CronJob | null } | null);
  const job = (resultDoc?.value ?? result) as CronJob;

  if (job?._id) {
    await collections.db.collection(COLLECTION_NAME).deleteMany({
      ...filter,
      _id: { $ne: job._id },
    });
  }

  return job;
}

export async function upsertPendingJobByPayload(
  jobType: string,
  payloadMatch: Record<string, unknown>,
  options: {
    scheduledFor: Date;
    priority?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    payload?: Record<string, unknown>;
  }
): Promise<CronJob> {
  const now = new Date();
  const filter = {
    jobType,
    ...buildPayloadQuery(payloadMatch),
  };

  const update = {
    $set: {
      jobType,
      status: 'pending' as const,
      scheduledFor: options.scheduledFor,
      priority: options.priority ?? 5,
      payload: options.payload ?? payloadMatch,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      retryDelayMs: options.retryDelayMs ?? 5000,
    },
  };

  const result = await collections.db.collection(COLLECTION_NAME).findOneAndUpdate(
    filter,
    update,
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  const resultDoc = (result as { value?: CronJob | null } | null);
  const job = (resultDoc?.value ?? result) as CronJob;

  if (job?._id) {
    await collections.db.collection(COLLECTION_NAME).deleteMany({
      ...filter,
      _id: { $ne: job._id },
    });
  }

  return job;
}
