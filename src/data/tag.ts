import { prisma } from '@/lib/prisma';
import type { Tag } from '@/entities';
import { generateUniqueSlug } from '@/utils';

export async function getAllTags() {
  return await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function getTagById(id: string) {
  return await prisma.tag.findUnique({
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

export async function createTag(data: Omit<Tag, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) {
  const existingSlugs = (await prisma.tag.findMany({ select: { slug: true } })).map((t) => t.slug);
  const slug = generateUniqueSlug(data.name, existingSlugs);
  
  return await prisma.tag.create({
    data: {
      ...data,
      slug,
    },
  });
}

export async function updateTag(id: string, data: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) {
  // If slug is provided or name changed, regenerate slug
  let updateData = { ...data };
  if (data.slug || data.name) {
    const existingSlugs = (await prisma.tag.findMany({ 
      where: { id: { not: id } },
      select: { slug: true } 
    })).map((t) => t.slug);
    
    if (data.slug) {
      updateData.slug = generateUniqueSlug(data.slug, existingSlugs);
    } else if (data.name) {
      updateData.slug = generateUniqueSlug(data.name, existingSlugs);
    }
  }
  
  return await prisma.tag.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteTag(id: string) {
  return await prisma.tag.delete({
    where: { id },
  });
}
