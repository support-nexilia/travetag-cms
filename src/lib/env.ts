const getEnv = (key: string, fallback?: string) => {
  return (
    process.env[key] ||
    (typeof import.meta !== 'undefined' && import.meta.env?.[key]) ||
    fallback ||
    ''
  );
};

export const IS_PROD =
  (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ||
  getEnv('NODE_ENV') === 'production';

export const MONGO_URI = getEnv('MONGO_URI');
export const MONGO_DB_NAME = getEnv('MONGO_DB_NAME');

export const OBJECT_STORAGE_ACCESS_KEY = getEnv('OBJECT_STORAGE_ACCESS_KEY');
export const OBJECT_STORAGE_SECRET_KEY = getEnv('OBJECT_STORAGE_SECRET_KEY');
export const OBJECT_STORAGE_ENDPOINT = getEnv('OBJECT_STORAGE_ENDPOINT');
export const OBJECT_STORAGE_BUCKET = getEnv('OBJECT_STORAGE_BUCKET');
export const OBJECT_STORAGE_REGION = getEnv('OBJECT_STORAGE_REGION', 'us-east-1');

export const BASEURL_MEDIA = getEnv('BASEURL_MEDIA');
export const BUNNY_STREAM_API_KEY = getEnv('BUNNY_STREAM_API_KEY');
export const BUNNY_STREAM_LIBRARY_ID = getEnv('BUNNY_STREAM_LIBRARY_ID');
export const BUNNY_STREAM_CDN_URL = getEnv('BUNNY_STREAM_CDN_URL');

export const ENABLE_PLAYGROUND = getEnv('ENABLE_PLAYGROUND', 'false').toLowerCase() === 'true';
export const GRAPHQL_JWT_ISSUER = getEnv(
  'GRAPHQL_JWT_ISSUER',
  'http://nexilia-club.localhost:4322',
);
export const GRAPHQL_JWT_DISCOVERY_URL = getEnv(
  'GRAPHQL_JWT_DISCOVERY_URL',
  `${GRAPHQL_JWT_ISSUER}/.well-known/openid-configuration`,
);
export const GRAPHQL_AUTH_DEBUG = getEnv('GRAPHQL_AUTH_DEBUG', 'false') === 'true';

export const SESSION_SECRET = getEnv('SESSION_SECRET');
export const HOST_URL = getEnv('HOST_URL');

export const OIDC_ISSUER = getEnv('OIDC_ISSUER');
export const OIDC_CLIENT_ID = getEnv('OIDC_CLIENT_ID');
export const OIDC_CLIENT_SECRET = getEnv('OIDC_CLIENT_SECRET');
export const OIDC_REDIRECT_URI = getEnv('OIDC_REDIRECT_URI');
