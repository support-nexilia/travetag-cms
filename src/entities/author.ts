import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { MediaImageSchema } from './media';

// Social object schema
export const SocialSchema = z.object({
  type: z.enum(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']),
  url: z.string().url(),
});

// Role enum
export const RoleSchema = z.enum(['admin', 'editor', 'tourleader']);

export const AuthorSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(1),
  nickname: z.string().optional(),
  email: z.string().email(),
  image: MediaImageSchema.optional(),
  background_image: MediaImageSchema.optional(),
  bio: z.string().optional(),
  is_admin: z.boolean().default(false),
  is_tour_leader: z.boolean().optional(),
  social: z.array(SocialSchema).default([]),
  languages: z.array(z.string()).default([]),
  // OIDC fields
  oidc_sub: z.string().optional(), // OIDC subject identifier
  role: RoleSchema.optional(), // User role from OIDC
  namespace: z.string().optional(), // Namespace from OIDC role
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateAuthorSchema = AuthorSchema.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateAuthorSchema = CreateAuthorSchema.partial();

export type Author = z.infer<typeof AuthorSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type CreateAuthor = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthor = z.infer<typeof UpdateAuthorSchema>;
