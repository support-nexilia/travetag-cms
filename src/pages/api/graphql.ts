import type { APIRoute } from 'astro';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import { typeDefs } from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';

const ENABLE_PLAYGROUND = import.meta.env.ENABLE_PLAYGROUND.toLowerCase() === 'true';
const GRAPHQL_JWT_ISSUER =
  import.meta.env.GRAPHQL_JWT_ISSUER ?? 'http://nexilia-club.localhost:4322';
const GRAPHQL_JWT_DISCOVERY_URL =
  import.meta.env.GRAPHQL_JWT_DISCOVERY_URL ??
  `${GRAPHQL_JWT_ISSUER}/.well-known/openid-configuration`;
const GRAPHQL_AUTH_DEBUG = import.meta.env.GRAPHQL_AUTH_DEBUG === 'true';

type Jwk = {
  kid?: string;
  kty: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
};

type Jwks = {
  keys: Jwk[];
};

let cachedJwks: Jwks | null = null;
let cachedJwksAt = 0;
const JWKS_TTL_MS = 5 * 60 * 1000;

async function getJwks(): Promise<Jwks> {
  const now = Date.now();
  if (cachedJwks && now - cachedJwksAt < JWKS_TTL_MS) {
    return cachedJwks;
  }

  const discoveryResponse = await fetch(GRAPHQL_JWT_DISCOVERY_URL);
  if (!discoveryResponse.ok) {
    throw new Error(`OIDC discovery failed: ${discoveryResponse.statusText}`);
  }

  const discovery = await discoveryResponse.json();
  const jwksResponse = await fetch(discovery.jwks_uri);
  if (!jwksResponse.ok) {
    throw new Error(`JWKS fetch failed: ${jwksResponse.statusText}`);
  }

  cachedJwks = await jwksResponse.json();
  cachedJwksAt = now;
  return cachedJwks!;
}

async function verifyRequestAuth(request: Request): Promise<Response | null> {
  const debugHeaders = (message: string) => {
    if (!GRAPHQL_AUTH_DEBUG) return {};
    return { 'X-GraphQL-Auth-Debug': message };
  };

  const authorization = request.headers.get('authorization');
  if (GRAPHQL_AUTH_DEBUG) {
    console.warn('graphql auth: incoming request headers', {
      hasAuthHeader: Boolean(authorization),
      authHeaderPrefix: authorization?.slice(0, 12),
      contentType: request.headers.get('content-type'),
    });
  }
  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql auth: missing bearer token', {
        hasAuthHeader: Boolean(authorization),
      });
    }
    return new Response('Missing bearer token', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer',
        ...debugHeaders('missing-bearer'),
      },
    });
  }

  const token = authorization.slice(7).trim();
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header) {
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql auth: invalid token structure');
    }
    return new Response('Invalid token', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
        ...debugHeaders('invalid-structure'),
      },
    });
  }

  if (GRAPHQL_AUTH_DEBUG) {
    console.warn('graphql auth: decoded token header', decoded.header);
    console.warn('graphql auth: decoded token claims', decoded.payload);
  }

  const tokenIssuer = typeof decoded.payload === 'object' ? decoded.payload?.iss : null;
  if (!tokenIssuer || typeof tokenIssuer !== 'string') {
    return new Response('Invalid token issuer', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
        ...debugHeaders('missing-issuer'),
      },
    });
  }

  const expectedOrigin = new URL(GRAPHQL_JWT_ISSUER).origin;
  const tokenOrigin = new URL(tokenIssuer).origin;
  if (tokenOrigin !== expectedOrigin) {
    return new Response('Invalid token issuer', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
        ...debugHeaders(`issuer-mismatch:${tokenOrigin}`),
      },
    });
  }

  const jwks = await getJwks();
  let jwk = jwks.keys.find((key) => key.kid && key.kid === decoded.header.kid);
  if (!jwk && jwks.keys.length === 1) {
    jwk = jwks.keys[0];
  }

  if (!jwk) {
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql auth: unknown signing key', {
        tokenKid: decoded.header.kid,
        availableKids: jwks.keys.map((key) => key.kid).filter(Boolean),
      });
    }
    return new Response('Unknown signing key', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
        ...debugHeaders(
          `unknown-kid:${decoded.header.kid ?? 'none'}`
        ),
      },
    });
  }

  try {
    const key = createPublicKey({ key: jwk, format: 'jwk' });
    jwt.verify(token, key);
  } catch (error) {
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql auth: token verify failed', {
        issuer: GRAPHQL_JWT_ISSUER,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return new Response('Invalid token', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'WWW-Authenticate': 'Bearer error="invalid_token"',
        ...debugHeaders(
          `verify-failed:${error instanceof Error ? error.message : 'unknown'}`
        ),
      },
    });
  }

  return null;
}

// === Configura Apollo Server ===
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: ENABLE_PLAYGROUND,
  plugins: ENABLE_PLAYGROUND
    ? [ApolloServerPluginLandingPageLocalDefault({ footer: false })]
    : [],
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
    const authError = await verifyRequestAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql request body keys', {
        keys: body && typeof body === 'object' ? Object.keys(body) : [],
        hasQuery: Boolean(body?.query),
        hasVariables: Boolean(body?.variables),
        operationName: body?.operationName ?? null,
      });
    }

    if (!body?.query || typeof body.query !== 'string') {
      return new Response(
        JSON.stringify({ errors: [{ message: 'Missing or invalid GraphQL query' }] }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...(GRAPHQL_AUTH_DEBUG
              ? { 'X-GraphQL-Auth-Debug': 'missing-query' }
              : {}),
          },
        }
      );
    }

    const response = await server.executeOperation({
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    });

    const result =
      response.body.kind === 'single' ? response.body.singleResult : response.body;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    if (GRAPHQL_AUTH_DEBUG) {
      console.warn('graphql request failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
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
