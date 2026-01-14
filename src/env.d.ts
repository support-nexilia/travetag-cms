/// <reference types="astro/client" />

import type { SessionData } from '@/lib/session';

interface ImportMetaEnv {
  readonly MONGO_URI: string;
  readonly MONGO_DB_NAME: string;
  readonly DATABASE_URL: string;
  readonly OBJECT_STORAGE_ACCESS_KEY: string;
  readonly OBJECT_STORAGE_SECRET_KEY: string;
  readonly OBJECT_STORAGE_ENDPOINT: string;
  readonly ENABLE_PLAYGROUND: string;
  readonly OIDC_ISSUER: string;
  readonly OIDC_CLIENT_ID: string;
  readonly OIDC_CLIENT_SECRET: string;
  readonly OIDC_REDIRECT_URI: string;
  readonly SESSION_SECRET: string;
  readonly GRAPHQL_JWT_ISSUER: string;
  readonly GRAPHQL_JWT_DISCOVERY_URL: string;
  readonly GRAPHQL_AUTH_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    session: SessionData;
  }
}
