import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId),
  oidc_sub: z.string(),
  issuer: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  audience: z.union([z.string(), z.array(z.string())]).optional(),
  scope: z.string().optional(),
  last_login_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
