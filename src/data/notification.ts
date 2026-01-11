import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { Notification, NotificationInput, NotificationStatus } from '@/entities/notification';

/**
 * Get all notifications with optional filters
 */
export async function getAllNotifications(
  status?: NotificationStatus,
  includeAll: boolean = false
): Promise<Notification[]> {
  const filter: any = {};
  
  if (status) {
    filter.status = status;
  } else if (!includeAll) {
    // By default, exclude failed notifications
    filter.status = { $ne: 'failed' };
  }
  
  const notifications = await collections.db
    .collection<Notification>('notifications')
    .find(filter)
    .sort({ created_at: -1 })
    .toArray();
  
  return notifications;
}

/**
 * Get scheduled notifications (status=scheduled and scheduled_at <= now)
 */
export async function getScheduledNotifications(): Promise<Notification[]> {
  const notifications = await collections.db
    .collection<Notification>('notifications')
    .find({
      status: 'scheduled',
      scheduled_at: { $lte: new Date() }
    })
    .sort({ scheduled_at: 1 })
    .toArray();
  
  return notifications;
}

/**
 * Get notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const notification = await collections.db
    .collection<Notification>('notifications')
    .findOne({ _id: new ObjectId(id) });
  
  return notification;
}

/**
 * Get notifications by author
 */
export async function getNotificationsByAuthor(authorId: string): Promise<Notification[]> {
  if (!ObjectId.isValid(authorId)) {
    return [];
  }
  
  const notifications = await collections.db
    .collection<Notification>('notifications')
    .find({ author_id: new ObjectId(authorId) })
    .sort({ created_at: -1 })
    .toArray();
  
  return notifications;
}

/**
 * Create new notification
 */
export async function createNotification(input: NotificationInput): Promise<Notification> {
  const now = new Date();
  
  const notification: Omit<Notification, '_id'> = {
    ...input,
    status: input.status || 'draft',
    sent_count: 0,
    failed_count: 0,
    created_at: now,
    updated_at: now,
  };
  
  const result = await collections.db
    .collection<Notification>('notifications')
    .insertOne(notification as any);
  
  return {
    ...notification,
    _id: result.insertedId,
  } as Notification;
}

/**
 * Update notification
 */
export async function updateNotification(
  id: string,
  updates: Partial<NotificationInput>
): Promise<Notification | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  // Check if notification is already sent
  const existing = await getNotificationById(id);
  if (!existing) {
    return null;
  }
  
  if (existing.status === 'sent') {
    throw new Error('Cannot modify sent notification');
  }
  
  const result = await collections.db
    .collection<Notification>('notifications')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  
  return result || null;
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }
  
  // Check if notification is already sent
  const existing = await getNotificationById(id);
  if (!existing) {
    return false;
  }
  
  if (existing.status === 'sent') {
    throw new Error('Cannot delete sent notification');
  }
  
  const result = await collections.db
    .collection<Notification>('notifications')
    .deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount === 1;
}

/**
 * Mark notification as sent
 */
export async function markNotificationAsSent(
  id: string,
  sentCount: number,
  failedCount: number
): Promise<Notification | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.db
    .collection<Notification>('notifications')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'sent',
          sent_at: new Date(),
          sent_count: sentCount,
          failed_count: failedCount,
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  
  return result || null;
}

/**
 * Mark notification as failed
 */
export async function markNotificationAsFailed(id: string): Promise<Notification | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.db
    .collection<Notification>('notifications')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'failed',
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  
  return result || null;
}
