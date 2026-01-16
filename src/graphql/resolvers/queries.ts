import * as CategoryData from '@/data/category';
import * as TagData from '@/data/tag';
import * as AuthorData from '@/data/author';
import * as ArticleData from '@/data/article';
import * as AdvData from '@/data/adv';
import * as MediaData from '@/data/media';

export const queries = {
  // Categories
  categories: async () => await CategoryData.getAllCategories(),
  category: async (_: any, { id }: { id: string }) => await CategoryData.getCategoryById(id),
  categoryBySlug: async (_: any, { slug }: { slug: string }) => await CategoryData.getCategoryBySlug(slug),

  // Tags
  tags: async () => await TagData.getAllTags(),
  tag: async (_: any, { id }: { id: string }) => await TagData.getTagById(id),
  tagBySlug: async (_: any, { slug }: { slug: string }) => await TagData.getTagBySlug(slug),

  // Authors
  authors: async () => await AuthorData.getAllAuthors(),
  author: async (_: any, { id }: { id: string }) => await AuthorData.getAuthorById(id),
  tourLeaders: async () => await AuthorData.getTourLeaders(),

  // Articles
  articles: async () => await ArticleData.getAllArticles(),
  article: async (_: any, { id }: { id: string }) => await ArticleData.getArticleById(id),
  articleBySlug: async (_: any, { slug }: { slug: string }) => await ArticleData.getArticleBySlug(slug),
  articlesByType: async (_: any, { type }: { type: string }) => {
    const articles = await ArticleData.getAllArticles();
    return articles.filter((a: any) => a.type === type);
  },
  publishedArticles: async () => {
    const articles = await ArticleData.getAllArticles();
    return articles.filter((a: any) => a.status === 'PUBLISHED');
  },

  // Advs
  advs: async () => await AdvData.getAllAdvs(),
  adv: async (_: any, { id }: { id: string }) => await AdvData.getAdvById(id),

  // Media
  media: async (_: any, { type, limit, skip }: { type?: string; limit?: number; skip?: number }, context: any) => {
    const namespace = context?.isAdmin ? undefined : context?.namespace;
    return await MediaData.getMediaList({
      namespace,
      type: type === 'image' || type === 'video' ? type : undefined,
      limit,
      skip,
    });
  },
  mediaById: async (_: any, { id }: { id: string }, context: any) => {
    const media = await MediaData.getMediaById(id);
    if (!media) return null;
    if (!context?.isAdmin && context?.namespace && media.namespace && media.namespace !== context.namespace) {
      return null;
    }
    return media;
  },
};
