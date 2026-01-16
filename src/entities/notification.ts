import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Enum schemas
export const NotificationTargetTypeSchema = z.enum(['all', 'user', 'segment']);
export const NotificationActionTypeSchema = z.enum(['article', 'author', 'category', 'tag', 'url', 'none']);
export const NotificationStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'failed']);

// Main Notification schema
export const NotificationSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  
  // Content
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  image_media_id: z.instanceof(ObjectId).optional(),
  
  // Target
  target_type: NotificationTargetTypeSchema,
  target_user_ids: z.array(z.string()).optional(),
  target_segment: z.string().optional(),
  
  // Action / Deep linking
  action_type: NotificationActionTypeSchema.optional(),
  action_id: z.string().optional(),
  action_url: z.string().url().optional(),
  
  // Scheduling
  scheduled_at: z.date().optional(),
  sent_at: z.date().optional(),
  
  // Status & metrics
  status: NotificationStatusSchema.default('draft'),
  sent_count: z.number().int().nonnegative().default(0),
  failed_count: z.number().int().nonnegative().default(0),
  
  // Author
  author_id: z.instanceof(ObjectId),
  
  // Timestamps
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

// Type inference
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationTargetType = z.infer<typeof NotificationTargetTypeSchema>;
export type NotificationActionType = z.infer<typeof NotificationActionTypeSchema>;
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

// Input schema for creating new notification (without auto-generated fields)
export const NotificationInputSchema = NotificationSchema.omit({
  _id: true,
  sent_at: true,
  sent_count: true,
  failed_count: true,
  created_at: true,
  updated_at: true,
}).partial({
  status: true,
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;

// Update schema (all fields optional except id)
export const NotificationUpdateSchema = NotificationSchema.partial().required({ _id: true });
export type NotificationUpdate = z.infer<typeof NotificationUpdateSchema>;
