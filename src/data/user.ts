import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { CreateUser, UpdateUser, User } from '@/entities/user';

export async function getAllUsers() {
  return await collections.users
    .find({})
    .sort({ created_at: -1 })
    .toArray() as User[];
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return await collections.users.findOne({ _id: new ObjectId(id) }) as User | null;
}

export async function getUserByEmail(email: string) {
  return await collections.users.findOne({ email }) as User | null;
}

export async function getUserByOidcSub(oidcSub: string, issuer: string) {
  return await collections.users.findOne({ oidc_sub: oidcSub, issuer }) as User | null;
}

export async function createUser(data: CreateUser) {
  const now = new Date();
  const result = await collections.users.insertOne({
    ...data,
    created_at: now,
    updated_at: now,
  });
  return await getUserById(result.insertedId.toString());
}

export async function updateUser(id: string, data: UpdateUser) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const result = await collections.users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updated_at: new Date(),
      },
    },
    { returnDocument: 'after' }
  );
  return result as User | null;
}

export async function deleteUser(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const result = await collections.users.findOneAndDelete({ _id: new ObjectId(id) });
  return result as User | null;
}

export async function createOrUpdateUserFromJwt(payload: {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  email?: string;
  name?: string;
  preferred_username?: string;
  scope?: string;
}) {
  if (!payload.sub || !payload.iss) {
    return null;
  }

  const now = new Date();
  const username = payload.preferred_username;
  const name = payload.name || payload.preferred_username;
  const existing = await getUserByOidcSub(payload.sub, payload.iss);

  if (existing) {
    const updateFields: UpdateUser = {
      last_login_at: now,
    };
    if (payload.email) updateFields.email = payload.email;
    if (username) updateFields.username = username;
    if (name) updateFields.name = name;
    if (payload.aud) updateFields.audience = payload.aud;
    if (payload.scope) updateFields.scope = payload.scope;

    const result = await collections.users.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...updateFields, updated_at: now } },
      { returnDocument: 'after' }
    );
    return result as User;
  }

  const newUser: CreateUser = {
    oidc_sub: payload.sub,
    issuer: payload.iss,
    username,
    email: payload.email,
    name,
    audience: payload.aud,
    scope: payload.scope,
    last_login_at: now,
  };

  const result = await collections.users.insertOne({
    ...newUser,
    created_at: now,
    updated_at: now,
  });

  return await getUserById(result.insertedId.toString());
}
