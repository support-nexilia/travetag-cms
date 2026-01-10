import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import type { APIRoute } from 'astro';
import * as UserData from '@/data/user';
import * as CategoryData from '@/data/category';
import * as TagData from '@/data/tag';
import * as PostData from '@/data/post';
import * as AdvData from '@/data/adv';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: ID!
    title: String!
    slug: String!
    description: String
    content: String
    date: String!
    status: String!
    userId: ID!
    user: User
    categories: [Category!]!
    tags: [Tag!]!
    createdAt: String!
    updatedAt: String!
  }

  type Adv {
    id: ID!
    title: String!
    subtitle: String
    link: String
    date: String!
    status: String!
    userId: ID!
    user: User
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    categories: [Category!]!
    category(id: ID!): Category
    tags: [Tag!]!
    tag(id: ID!): Tag
    posts: [Post!]!
    post(id: ID!): Post
    postBySlug(slug: String!): Post
    advs: [Adv!]!
    adv(id: ID!): Adv
  }

  type Mutation {
    createCategory(name: String!, description: String): Category!
    updateCategory(id: ID!, name: String, description: String): Category!
    deleteCategory(id: ID!): Category!

    createTag(name: String!, description: String): Tag!
    updateTag(id: ID!, name: String, description: String): Tag!
    deleteTag(id: ID!): Tag!

    createPost(
      title: String!
      slug: String!
      description: String
      content: String
      date: String!
      status: String!
      userId: ID!
      categoryIds: [ID!]!
      tagIds: [ID!]!
    ): Post!

    updatePost(
      id: ID!
      title: String
      slug: String
      description: String
      content: String
      date: String
      status: String
      categoryIds: [ID!]
      tagIds: [ID!]
    ): Post!

    deletePost(id: ID!, softDelete: Boolean): Post!

    createAdv(
      title: String!
      subtitle: String
      link: String
      date: String!
      status: String!
      userId: ID!
    ): Adv!

    updateAdv(
      id: ID!
      title: String
      subtitle: String
      link: String
      date: String
      status: String
    ): Adv!

    deleteAdv(id: ID!, softDelete: Boolean): Adv!
  }
`;

const resolvers = {
  Query: {
    users: async () => await UserData.getAllUsers(),
    user: async (_: any, { id }: { id: string }) => await UserData.getUserById(id),
    categories: async () => await CategoryData.getAllCategories(),
    category: async (_: any, { id }: { id: string }) => await CategoryData.getCategoryById(id),
    tags: async () => await TagData.getAllTags(),
    tag: async (_: any, { id }: { id: string }) => await TagData.getTagById(id),
    posts: async () => await PostData.getAllPosts(),
    post: async (_: any, { id }: { id: string }) => await PostData.getPostById(id),
    postBySlug: async (_: any, { slug }: { slug: string }) => await PostData.getPostBySlug(slug),
    advs: async () => await AdvData.getAllAdvs(),
    adv: async (_: any, { id }: { id: string }) => await AdvData.getAdvById(id),
  },
  Mutation: {
    createCategory: async (_: any, args: any) => await CategoryData.createCategory(args),
    updateCategory: async (_: any, { id, ...data }: any) => await CategoryData.updateCategory(id, data),
    deleteCategory: async (_: any, { id }: { id: string }) => await CategoryData.deleteCategory(id),

    createTag: async (_: any, args: any) => await TagData.createTag(args),
    updateTag: async (_: any, { id, ...data }: any) => await TagData.updateTag(id, data),
    deleteTag: async (_: any, { id }: { id: string }) => await TagData.deleteTag(id),

    createPost: async (_: any, { categoryIds, tagIds, ...data }: any) =>
      await PostData.createPost(data, categoryIds, tagIds),
    updatePost: async (_: any, { id, categoryIds, tagIds, ...data }: any) =>
      await PostData.updatePost(id, data, categoryIds, tagIds),
    deletePost: async (_: any, { id, softDelete = true }: any) => await PostData.deletePost(id, softDelete),

    createAdv: async (_: any, args: any) => await AdvData.createAdv(args),
    updateAdv: async (_: any, { id, ...data }: any) => await AdvData.updateAdv(id, data),
    deleteAdv: async (_: any, { id, softDelete = true }: any) => await AdvData.deleteAdv(id, softDelete),
  },
  Post: {
    user: async (parent: any) => await UserData.getUserById(parent.userId),
    categories: async (parent: any) => {
      const post = await PostData.getPostById(parent.id);
      return post?.categories.map((c: any) => c.category) || [];
    },
    tags: async (parent: any) => {
      const post = await PostData.getPostById(parent.id);
      return post?.tags.map((t: any) => t.tag) || [];
    },
  },
  Adv: {
    user: async (parent: any) => await UserData.getUserById(parent.userId),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startedServer = await server.start();

export const ALL: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  const response = await server.executeOperation({
    query: body.query,
    variables: body.variables,
    operationName: body.operationName,
  });

  return new Response(JSON.stringify(response.body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
