import * as CategoryData from '@/data/category';
import * as TagData from '@/data/tag';
import * as AuthorData from '@/data/author';
import * as ArticleData from '@/data/article';
import * as AdvData from '@/data/adv';

export const mutations = {
  // Categories
  createCategory: async (_: any, args: any) => await CategoryData.createCategory(args),
  updateCategory: async (_: any, { id, ...data }: any) => await CategoryData.updateCategory(id, data),
  deleteCategory: async (_: any, { id }: { id: string }) => await CategoryData.deleteCategory(id),

  // Tags
  createTag: async (_: any, args: any) => await TagData.createTag(args),
  updateTag: async (_: any, { id, ...data }: any) => await TagData.updateTag(id, data),
  deleteTag: async (_: any, { id }: { id: string }) => await TagData.deleteTag(id),

  // Authors
  createAuthor: async (_: any, args: any) => await AuthorData.createAuthor(args),
  updateAuthor: async (_: any, { id, ...data }: any) => await AuthorData.updateAuthor(id, data),
  deleteAuthor: async (_: any, { id }: { id: string }) => await AuthorData.deleteAuthor(id),

  // Articles
  createArticle: async (_: any, { tag_ids, ...data }: any) => {
    return await ArticleData.createArticle({ ...data, tag_ids });
  },
  updateArticle: async (_: any, { id, tag_ids, ...data }: any) => {
    const updateData = tag_ids ? { ...data, tag_ids } : data;
    return await ArticleData.updateArticle(id, updateData);
  },
  deleteArticle: async (_: any, { id }: { id: string }) => await ArticleData.deleteArticle(id),

  // Advs
  createAdv: async (_: any, args: any) => await AdvData.createAdv(args),
  updateAdv: async (_: any, { id, ...data }: any) => await AdvData.updateAdv(id, data),
  deleteAdv: async (_: any, { id }: { id: string }) => await AdvData.deleteAdv(id),
};
