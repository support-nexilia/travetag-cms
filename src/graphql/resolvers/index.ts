import { queries } from './queries';
import { mutations } from './mutations';
import { fieldResolvers } from './fields';

export const resolvers = {
  Query: queries,
  Mutation: mutations,
  ...fieldResolvers,
};
