import * as AuthorData from '@/data/author';
import * as TagData from '@/data/tag';
import * as ArticleData from '@/data/article';
import * as MediaData from '@/data/media';

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
    image: async (parent: any) => {
      if (!parent.image_media_id) return null;
      return await MediaData.getMediaById(parent.image_media_id.toString());
    },
    video_full: async (parent: any) => {
      if (!parent.video_full_media_id) return null;
      return await MediaData.getMediaById(parent.video_full_media_id.toString());
    },
    itinerary_image: async (parent: any) => {
      if (!parent.itinerary_image_media_id) return null;
      return await MediaData.getMediaById(parent.itinerary_image_media_id.toString());
    },
  },
  Author: {
    image: async (parent: any) => {
      if (!parent.image_media_id) return null;
      return await MediaData.getMediaById(parent.image_media_id.toString());
    },
    background_image: async (parent: any) => {
      if (!parent.background_image_media_id) return null;
      return await MediaData.getMediaById(parent.background_image_media_id.toString());
    },
  },
  Tag: {
    image: async (parent: any) => {
      if (!parent.image_media_id) return null;
      return await MediaData.getMediaById(parent.image_media_id.toString());
    },
  },
  Adv: {
    image: async (parent: any) => {
      if (!parent.image_media_id) return null;
      return await MediaData.getMediaById(parent.image_media_id.toString());
    },
  },
  MediaFile: {
    __resolveType: (obj: any) => {
      if (obj?.formats) return 'MediaVideo';
      if (obj?.sizes) return 'MediaImage';
      if (obj?.url) return 'MediaDocument';
      return null;
    },
  },
  Media: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    createdAt: (parent: any) => parent.created_at?.toISOString?.() || parent.createdAt,
    updatedAt: (parent: any) => parent.updated_at?.toISOString?.() || parent.updatedAt,
  },
};
