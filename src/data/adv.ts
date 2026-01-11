import { collections } from '@/lib/mongodb';
import type { Adv, CreateAdv, UpdateAdv } from '@/entities';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'advs';

/**
 * Ottiene tutti gli advs
 * Filtra per pubblicati e attivi (entro date start/end se presenti)
 */
export async function getAllAdvs(includeUnpublished = false) {
  const now = new Date();
  
  const filter: any = {};
  
  if (!includeUnpublished) {
    filter.published = true;
    filter.$or = [
      { start_date: { $exists: false } },
      { start_date: { $lte: now } },
    ];
    filter.$and = [
      {
        $or: [
          { end_date: { $exists: false } },
          { end_date: { $gte: now } },
        ],
      },
    ];
  }
  
  const advs = await collections.db
    .collection(COLLECTION_NAME)
    .find(filter)
    .sort({ priority: -1, published_date: -1 })
    .toArray();
  
  return advs.map((adv) => ({
    ...adv,
    _id: adv._id?.toString(),
    author_id: adv.author_id?.toString(),
  })) as Adv[];
}

/**
 * Ottiene advs per posizione specifica
 */
export async function getAdvsByPosition(position: string, limit = 5) {
  const now = new Date();
  
  const advs = await collections.db
    .collection(COLLECTION_NAME)
    .find({
      published: true,
      position,
      $or: [
        { start_date: { $exists: false } },
        { start_date: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { end_date: { $exists: false } },
            { end_date: { $gte: now } },
          ],
        },
      ],
    })
    .sort({ priority: -1, published_date: -1 })
    .limit(limit)
    .toArray();
  
  return advs.map((adv) => ({
    ...adv,
    _id: adv._id?.toString(),
    author_id: adv.author_id?.toString(),
  })) as Adv[];
}

/**
 * Ottiene un adv per ID
 */
export async function getAdvById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const adv = await collections.db
    .collection(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(id) });
  
  if (!adv) return null;
  
  return {
    ...adv,
    _id: adv._id?.toString(),
    author_id: adv.author_id?.toString(),
  } as Adv;
}

/**
 * Crea un nuovo adv
 */
export async function createAdv(data: CreateAdv) {
  const now = new Date();
  
  const result = await collections.db
    .collection(COLLECTION_NAME)
    .insertOne({
      ...data,
      author_id: new ObjectId(data.author_id),
      impressions: 0,
      clicks: 0,
      created_at: now,
      updated_at: now,
    });
  
  const adv = await getAdvById(result.insertedId.toString());
  
  if (data.start_date && data.start_date > now) {
    console.log(`📅 Adv scheduled for publication: "${data.title}" at ${data.start_date.toLocaleString('it-IT')}`);
  }
  
  return adv;
}

/**
 * Aggiorna un adv esistente
 */
export async function updateAdv(id: string, data: UpdateAdv) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const now = new Date();
  
  const { _id, created_at, ...updateData } = data;
  
  await collections.db
    .collection(COLLECTION_NAME)
    .updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          ...(updateData.author_id ? { author_id: new ObjectId(updateData.author_id) } : {}),
          updated_at: now,
        },
      }
    );
  
  const adv = await getAdvById(id);
  
  if (data.start_date && data.start_date > now) {
    console.log(`📅 Adv rescheduled for publication: "${adv?.title}" at ${data.start_date.toLocaleString('it-IT')}`);
  }
  
  return adv;
}

/**
 * Elimina un adv
 */
export async function deleteAdv(id: string) {
  if (!ObjectId.isValid(id)) {
    return;
  }
  
  await collections.db
    .collection(COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) });
}

/**
 * Incrementa il contatore impressioni
 */
export async function incrementImpressions(id: string) {
  if (!ObjectId.isValid(id)) {
    return;
  }
  
  await collections.db
    .collection(COLLECTION_NAME)
    .updateOne(
      { _id: new ObjectId(id) },
      { $inc: { impressions: 1 } }
    );
}

/**
 * Incrementa il contatore click
 */
export async function incrementClicks(id: string) {
  if (!ObjectId.isValid(id)) {
    return;
  }
  
  await collections.db
    .collection(COLLECTION_NAME)
    .updateOne(
      { _id: new ObjectId(id) },
      { $inc: { clicks: 1 } }
    );
}
