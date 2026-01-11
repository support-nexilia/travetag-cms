import { ObjectId } from 'mongodb';
import { collections } from '@/lib/mongodb';
import type { Category, CreateCategory, UpdateCategory } from '@/entities';
import { generateUniqueSlug } from '@/utils';

export async function getAllCategories(): Promise<Category[]> {
  const categories = await collections.categories.find({}).sort({ name: 1 }).toArray();
  return categories as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!ObjectId.isValid(id)) return null;
  const category = await collections.categories.findOne({ _id: new ObjectId(id) });
  return category as Category | null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await collections.categories.findOne({ slug });
  return category as Category | null;
}

export async function createCategory(data: CreateCategory): Promise<Category> {
  const existingSlugs = (await collections.categories.find({}, { projection: { slug: 1 } }).toArray()).map((c) => c.slug);
  const slug = generateUniqueSlug(data.name, existingSlugs);
  
  const now = new Date();
  const newCategory = {
    ...data,
    slug,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await collections.categories.insertOne(newCategory);
  return { ...newCategory, _id: result.insertedId } as Category;
}

export async function updateCategory(id: string, data: UpdateCategory): Promise<Category | null> {
  if (!ObjectId.isValid(id)) return null;
  
  let updateData: any = { ...data };
  
  // If slug is provided or name changed, regenerate slug
  if (data.slug || data.name) {
    const existingSlugs = (await collections.categories.find(
      { _id: { $ne: new ObjectId(id) } },
      { projection: { slug: 1 } }
    ).toArray()).map((c) => c.slug);
    
    if (data.slug) {
      updateData.slug = generateUniqueSlug(data.slug, existingSlugs);
    } else if (data.name) {
      updateData.slug = generateUniqueSlug(data.name, existingSlugs);
    }
  }
  
  updateData.updatedAt = new Date();
  
  const result = await collections.categories.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result as Category | null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  
  const result = await collections.categories.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getArticleCountByCategory(id: string): Promise<number> {
  if (!ObjectId.isValid(id)) return 0;
  
  return await collections.articles.countDocuments({
    category_ids: new ObjectId(id)
  });
}
