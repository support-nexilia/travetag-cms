import { z } from 'zod';

// TypeAge schema
export const TypeAgeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

// VideoFull schema
export const VideoFullSchema = z.object({
  url: z.string().optional(),
  url_mp4: z.string().optional(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  public: z.boolean().optional(),
  podcast: z.boolean().optional(),
  meride_embed_id: z.string().optional(),
});

// Schema per AppSettings - configurazione globale applicazione
export const AppSettingsSchema = z.object({
  _id: z.string().optional(), // ObjectId come string

  // Versione e descrizione
  minimum_supported_version: z.number().optional().default(0),
  traveltaggers_description: z.string().optional(),

  // Rimborsi
  refund_within_hours: z.number().optional(),
  partial_refund_within_hours_of_departure: z.number().optional(),

  // Range età
  newborns_age: TypeAgeSchema.optional(),
  children_age: TypeAgeSchema.optional(),

  // Ordine sezioni home
  main_sections_order: z.array(z.string()).optional(), // ["main", "adv", "chat"]

  // Video principale
  video_full: z.union([z.string(), VideoFullSchema]).optional(), // PRIMA IMPLEMENTAZIONE: String (URL) - FUTURO: VideoFull object

  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type TypeAge = z.infer<typeof TypeAgeSchema>;
export type VideoFull = z.infer<typeof VideoFullSchema>;

// Export singolo per chiarezza
export default AppSettingsSchema;
