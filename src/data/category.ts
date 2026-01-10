import { prisma } from '@/lib/prisma';
import type { Category } from '@/entities';
import { generateUniqueSlug } from '@/utils';

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      posts: {
        include: {
          post: true,
        },
      },
    },
  });
}

export async function createCategory(data: Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) {
  const existingSlugs = (await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug);
  const slug = generateUniqueSlug(data.name, existingSlugs);
  
  return await prisma.category.create({
    data: {
      ...data,
      slug,
    },
  });
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) {
  // If slug is provided or name changed, regenerate slug
  let updateData = { ...data };
  if (data.slug || data.name) {
    const existingSlugs = (await prisma.category.findMany({ 
      where: { id: { not: id } },
      select: { slug: true } 
    })).map((c) => c.slug);
    
    if (data.slug) {
      updateData.slug = generateUniqueSlug(data.slug, existingSlugs);
    } else if (data.name) {
      updateData.slug = generateUniqueSlug(data.name, existingSlugs);
    }
  }
  
  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  });
}
