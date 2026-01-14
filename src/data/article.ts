import { collections } from '@/lib/mongodb';
import type { Article, CreateArticle, UpdateArticle } from '@/entities/article';
import { ObjectId } from 'mongodb';

export async function getAllArticles(namespace?: string) {
  const filter: any = {};
  if (namespace) {
    filter.namespace = namespace;
  }
  return await collections.articles
    .find(filter)
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function getPublishedArticles(namespace?: string) {
  const filter: any = { published: true };
  if (namespace) {
    filter.namespace = namespace;
  }
  return await collections.articles
    .find(filter)
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function getArticleById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return await collections.articles.findOne({ 
    _id: new ObjectId(id) 
  }) as Article | null;
}

export async function getArticleBySlug(slug: string) {
  return await collections.articles.findOne({ 
    slug 
  }) as Article | null;
}

export async function getArticlesByAuthor(authorId: string) {
  if (!ObjectId.isValid(authorId)) {
    return [];
  }
  return await collections.articles
    .find({ author_id: new ObjectId(authorId) })
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function getArticlesByType(type: 'REMEMBER' | 'BOOK_NOW', namespace?: string) {
  const filter: any = { type };
  if (namespace) {
    filter.namespace = namespace;
  }
  return await collections.articles
    .find(filter)
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function getArticlesByTag(tagId: string) {
  if (!ObjectId.isValid(tagId)) {
    return [];
  }
  return await collections.articles
    .find({ tag_ids: new ObjectId(tagId) })
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function getArticlesByCategory(categoryId: number) {
  return await collections.articles
    .find({ category_id: categoryId })
    .sort({ published_date: -1 })
    .toArray() as Article[];
}

export async function createArticle(data: CreateArticle) {
  const now = new Date();
  const result = await collections.articles.insertOne({
    ...data,
    created_at: now,
    updated_at: now,
  });
  
  return await getArticleById(result.insertedId.toString());
}

export async function updateArticle(id: string, data: UpdateArticle) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.articles.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updated_at: new Date(),
      }
    },
    { returnDocument: 'after' }
  );
  
  return result as Article | null;
}

export async function deleteArticle(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.articles.findOneAndDelete({ 
    _id: new ObjectId(id) 
  });
  
  return result as Article | null;
}

export async function publishArticle(id: string) {
  return await updateArticle(id, { published: true });
}

export async function unpublishArticle(id: string) {
  return await updateArticle(id, { published: false });
}
