import { z } from 'zod';

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

export type MediaImage = z.infer<typeof MediaImageSchema>;
export type MediaVideo = z.infer<typeof MediaVideoSchema>;
