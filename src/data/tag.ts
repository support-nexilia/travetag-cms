import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { Tag, CreateTag, UpdateTag } from '@/entities';
import { generateUniqueSlug } from '@/utils';

export async function getAllTags(): Promise<Tag[]> {
  const tags = await collections.tags.find({}).sort({ name: 1 }).toArray();
  return tags as Tag[];
}

export async function getTagById(id: string): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  const tag = await collections.tags.findOne({ _id: new ObjectId(id) });
  return tag as Tag | null;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const tag = await collections.tags.findOne({ slug });
  return tag as Tag | null;
}

export async function createTag(data: CreateTag): Promise<Tag> {
  const existingSlugs = (await collections.tags.find({}, { projection: { slug: 1 } }).toArray()).map((t) => t.slug);
  const slug = generateUniqueSlug(data.name, existingSlugs);
  
  const now = new Date();
  const newTag = {
    ...data,
    slug,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await collections.tags.insertOne(newTag);
  return { ...newTag, _id: result.insertedId } as Tag;
}

export async function updateTag(id: string, data: UpdateTag): Promise<Tag | null> {
  if (!ObjectId.isValid(id)) return null;
  
  let updateData: any = { ...data };
  
  // If slug is provided or name changed, regenerate slug
  if (data.slug || data.name) {
    const existingSlugs = (await collections.tags.find(
      { _id: { $ne: new ObjectId(id) } },
      { projection: { slug: 1 } }
    ).toArray()).map((t) => t.slug);
    
    if (data.slug) {
      updateData.slug = generateUniqueSlug(data.slug, existingSlugs);
    } else if (data.name) {
      updateData.slug = generateUniqueSlug(data.name, existingSlugs);
    }
  }
  
  updateData.updatedAt = new Date();
  
  const result = await collections.tags.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result as Tag | null;
}

export async function deleteTag(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  
  const result = await collections.tags.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getArticleCountByTag(id: string): Promise<number> {
  if (!ObjectId.isValid(id)) return 0;
  
  return await collections.articles.countDocuments({
    tag_ids: new ObjectId(id)
  });
}
