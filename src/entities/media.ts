import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const MediaImageSchema = z.object({
  path: z.string(),
  sizes: z
    .object({
      s: z.string().optional(),
      xl: z.string().optional(),
    })
    .optional(),
});

export const MediaVideoSchema = z.object({
  path: z.string(),
  formats: z
    .object({
      m3u: z.string().optional(),
      mp4: z.string().optional(),
    })
    .optional(),
});

export const MediaFileSchema = z.object({
  path: z.string(),
  url: z.string().optional(),
});

export const MediaTypeSchema = z.enum(['image', 'video', 'file']);

export const MediaRecordSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  type: MediaTypeSchema,
  file: z.union([MediaImageSchema, MediaVideoSchema, MediaFileSchema]),
  original_filename: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
  title: z.string().optional(),
  alt: z.string().optional(),
  author_id: z.instanceof(ObjectId).optional(),
  namespace: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type MediaImage = z.infer<typeof MediaImageSchema>;
export type MediaVideo = z.infer<typeof MediaVideoSchema>;
export type MediaFile = z.infer<typeof MediaFileSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type MediaRecord = z.infer<typeof MediaRecordSchema>;
