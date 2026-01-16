import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { MediaRecord } from '@/entities/media';

export async function getMediaById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  return (await collections.media.findOne({ _id: new ObjectId(id) })) as MediaRecord | null;
}

export async function getMediaList({
  namespace,
  type,
  limit = 50,
  skip = 0,
}: {
  namespace?: string;
  type?: 'image' | 'video' | 'file';
  limit?: number;
  skip?: number;
}) {
  const filter: any = {};
  if (namespace) filter.namespace = namespace;
  if (type) filter.type = type;
  return (await collections.media
    .find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()) as MediaRecord[];
}

export async function createMedia(data: Omit<MediaRecord, '_id'>) {
  const now = new Date();
  const result = await collections.media.insertOne({
    ...data,
    created_at: now,
    updated_at: now,
  });
  return await getMediaById(result.insertedId.toString());
}

export async function deleteMedia(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const result = await collections.media.findOneAndDelete({ _id: new ObjectId(id) });
  return result as MediaRecord | null;
}

export async function updateMedia(id: string, data: Partial<MediaRecord>) {
  if (!ObjectId.isValid(id)) return null;
  const result = await collections.media.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updated_at: new Date(),
      },
    },
    { returnDocument: 'after' },
  );
  return result as MediaRecord | null;
}
