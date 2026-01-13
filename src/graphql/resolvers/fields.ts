import * as AuthorData from '@/data/author';
import * as TagData from '@/data/tag';
import * as ArticleData from '@/data/article';

export const fieldResolvers = {
  Article: {
    author: async (parent: any) => {
      if (!parent.author_id) return null;
      return await AuthorData.getAuthorById(parent.author_id.toString());
    },
    tour_leader: async (parent: any) => {
      if (!parent.tour_leader_id) return null;
      return await AuthorData.getAuthorById(parent.tour_leader_id.toString());
    },
    tags: async (parent: any) => {
      const article = await ArticleData.getArticleById(parent.id || parent._id.toString());
      if (!article?.tag_ids) return [];
      
      const tags = await Promise.all(
        article.tag_ids.map((tagId: any) => TagData.getTagById(tagId.toString()))
      );
      return tags.filter(Boolean);
    },
  },
};
