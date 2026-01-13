// src/pages/graphql.ts
import type { APIRoute } from 'astro';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';

const ENABLE_PLAYGROUND = import.meta.env.ENABLE_PLAYGROUND.toLowerCase() === 'true';


// === Configura Apollo Server ===
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: ENABLE_PLAYGROUND,
  plugins: ENABLE_PLAYGROUND ? [
    ApolloServerPluginLandingPageLocalDefault({ footer: false })
  ] : [],
});

// Avvia il server (Apollo v4 richiede start() prima di eseguire richieste)
await server.start();

// === OPTIONS per CORS preflight ===
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// === POST: GraphQL API ===
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const response = await server.executeOperation({
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    });

    const result = response.body.kind === 'single'
      ? response.body.singleResult
      : response.body;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ errors: [{ message: 'Invalid request' }] }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

// === GET: Apollo Sandbox UI ===
export const GET: APIRoute = async ({ request }) => {
  if (!ENABLE_PLAYGROUND) {
    return new Response('GraphQL Playground is disabled', { status: 403 });
  }

  const landingPage = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: 'GET',
      headers: new Map(request.headers.entries()),
      search: new URL(request.url).search,
      body: null,
    },
    context: async () => ({}),
  });

  if (landingPage.body.kind !== 'complete') {
    return new Response('Unexpected response', { status: 500 });
  }

  return new Response(landingPage.body.string, {
    status: landingPage.status || 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
