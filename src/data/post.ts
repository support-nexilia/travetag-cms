import { prisma } from '@/lib/prisma';
import type { Post } from '@/entities';
import { slugify } from '@/utils';

export async function getAllPosts(includeDeleted = false) {
  return await prisma.post.findMany({
    where: includeDeleted ? {} : { status: { not: 'DELETED' } },
    orderBy: { date: 'desc' },
    include: {
      user: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      revisions: true,
      parent: true,
    },
  });
}

export async function getPostById(id: string) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      user: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      revisions: {
        orderBy: { date: 'desc' },
      },
      parent: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      user: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function createPost(
  data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>,
  categoryIds: string[],
  tagIds: string[]
) {
  const existingSlugs = (await prisma.post.findMany({ select: { slug: true } })).map((p) => p.slug);
  const uniqueSlug = slugify(data.slug);
  let finalSlug = uniqueSlug;
  let counter = 1;
  
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${uniqueSlug}-${counter}`;
    counter++;
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: finalSlug,
      description: data.description,
      content: data.content,
      date: data.date,
      status: data.status,
      userId: data.userId,
      parentId: data.parentId,
      categories: {
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      tags: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Log scheduled publication
  if (data.status === 'PLANNED') {
    console.log(`📅 Post scheduled for publication: "${data.title}" at ${data.date.toLocaleString('it-IT')}`);
  }

  return post;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>,
  categoryIds?: string[],
  tagIds?: string[]
) {
  const updateData: any = { ...data };

  if (categoryIds !== undefined) {
    updateData.categories = {
      deleteMany: {},
      create: categoryIds.map((categoryId) => ({
        category: { connect: { id: categoryId } },
      })),
    };
  }

  if (tagIds !== undefined) {
    updateData.tags = {
      deleteMany: {},
      create: tagIds.map((tagId) => ({
        tag: { connect: { id: tagId } },
      })),
    };
  }

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Log scheduled publication
  if (data.status === 'PLANNED' && data.date) {
    console.log(`📅 Post rescheduled for publication: "${post.title}" at ${data.date.toLocaleString('it-IT')}`);
  }

  return post;
}

export async function deletePost(id: string, softDelete = true) {
  if (softDelete) {
    return await prisma.post.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  } else {
    return await prisma.post.delete({
      where: { id },
    });
  }
}

export async function getPostRevisions(postId: string) {
  return await prisma.post.findMany({
    where: { parentId: postId },
    orderBy: { date: 'desc' },
    include: {
      user: true,
    },
  });
}

export async function createRevision(originalPostId: string, userId: string) {
  const original = await getPostById(originalPostId);
  if (!original) throw new Error('Original post not found');

  const categoryIds = original.categories.map((c) => c.categoryId);
  const tagIds = original.tags.map((t) => t.tagId);

  return await createPost(
    {
      title: original.title,
      slug: original.slug,
      description: original.description,
      content: original.content,
      date: new Date(),
      status: 'REVISION',
      userId,
      parentId: originalPostId,
    },
    categoryIds,
    tagIds
  );
}
