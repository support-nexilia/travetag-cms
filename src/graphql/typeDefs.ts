import { gql } from 'graphql-tag';

export const typeDefs = gql`
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
    createdAt: String!
    updatedAt: String!
  }

  type Author {
    id: ID!
    name: String!
    bio: String
    image: String
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
    image: String
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
    image: String
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
  }

  type Mutation {
    # Categories
    createCategory(name: String!, description: String): Category!
    updateCategory(id: ID!, name: String, description: String): Category!
    deleteCategory(id: ID!): Category!

    # Tags
    createTag(name: String!, description: String): Tag!
    updateTag(id: ID!, name: String, description: String): Tag!
    deleteTag(id: ID!): Tag!

    # Authors
    createAuthor(
      name: String!
      bio: String
      image: String
      role: String!
    ): Author!
    updateAuthor(
      id: ID!
      name: String
      bio: String
      image: String
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
      image: String
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
      image: String
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
      image: String
      date: String!
      status: String!
    ): Adv!

    updateAdv(
      id: ID!
      title: String
      subtitle: String
      link: String
      image: String
      date: String
      status: String
    ): Adv!

    deleteAdv(id: ID!): Adv!
  }
`;
