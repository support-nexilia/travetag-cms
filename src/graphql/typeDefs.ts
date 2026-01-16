import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type MediaImage {
    path: String!
    sizes_s: String
    sizes_xl: String
  }

  type MediaVideo {
    path: String!
    formats_m3u: String
    formats_mp4: String
  }

  type MediaDocument {
    path: String!
    url: String
  }

  union MediaFile = MediaImage | MediaVideo | MediaDocument

  type Media {
    id: ID!
    type: String!
    file: MediaFile!
    original_filename: String
    mime_type: String
    size: Int
    title: String
    alt: String
    author_id: ID
    namespace: String
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Tag {
    id: ID!
    name: String!
    slug: String!
    description: String
    image_media_id: ID
    image: Media
    createdAt: String!
    updatedAt: String!
  }

  type Author {
    id: ID!
    name: String!
    bio: String
    image_media_id: ID
    image: Media
    background_image_media_id: ID
    background_image: Media
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Article {
    id: ID!
    title: String!
    subtitle: String
    slug: String!
    excerpt: String
    description: String
    image_media_id: ID
    image: Media
    video_full_media_id: ID
    video_full: Media
    itinerary_image_media_id: ID
    itinerary_image: Media
    type: String!
    status: String!
    published_date: String!
    author_id: ID!
    author: Author
    tour_leader_id: ID
    tour_leader: Author
    tags: [Tag!]!
    createdAt: String!
    updatedAt: String!
  }

  type Adv {
    id: ID!
    title: String!
    subtitle: String
    link: String
    image_media_id: ID
    image: Media
    date: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    # Categories
    categories: [Category!]!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category

    # Tags
    tags: [Tag!]!
    tag(id: ID!): Tag
    tagBySlug(slug: String!): Tag

    # Authors
    authors: [Author!]!
    author(id: ID!): Author
    tourLeaders: [Author!]!

    # Articles
    articles: [Article!]!
    article(id: ID!): Article
    articleBySlug(slug: String!): Article
    articlesByType(type: String!): [Article!]!
    publishedArticles: [Article!]!

    # Advs
    advs: [Adv!]!
    adv(id: ID!): Adv

    # Media
    media(type: String, limit: Int, skip: Int): [Media!]!
    mediaById(id: ID!): Media
  }

  type Mutation {
    # Categories
    createCategory(name: String!, description: String): Category!
    updateCategory(id: ID!, name: String, description: String): Category!
    deleteCategory(id: ID!): Category!

    # Tags
    createTag(name: String!, description: String): Tag!
    updateTag(id: ID!, name: String, description: String, image_media_id: ID): Tag!
    deleteTag(id: ID!): Tag!

    # Authors
    createAuthor(
      name: String!
      bio: String
      image_media_id: ID
      background_image_media_id: ID
      role: String!
    ): Author!
    updateAuthor(
      id: ID!
      name: String
      bio: String
      image_media_id: ID
      background_image_media_id: ID
      role: String
    ): Author!
    deleteAuthor(id: ID!): Author!

    # Articles
    createArticle(
      title: String!
      subtitle: String
      slug: String!
      excerpt: String
      description: String
      image_media_id: ID
      video_full_media_id: ID
      itinerary_image_media_id: ID
      type: String!
      status: String!
      published_date: String!
      author_id: ID!
      tour_leader_id: ID
      tag_ids: [ID!]!
    ): Article!

    updateArticle(
      id: ID!
      title: String
      subtitle: String
      slug: String
      excerpt: String
      description: String
      image_media_id: ID
      video_full_media_id: ID
      itinerary_image_media_id: ID
      status: String
      published_date: String
      tag_ids: [ID!]
    ): Article!

    deleteArticle(id: ID!): Article!

    # Advs
    createAdv(
      title: String!
      subtitle: String
      link: String
      image_media_id: ID
      date: String!
      status: String!
    ): Adv!

    updateAdv(
      id: ID!
      title: String
      subtitle: String
      link: String
      image_media_id: ID
      date: String
      status: String
    ): Adv!

    deleteAdv(id: ID!): Adv!
  }
`;
