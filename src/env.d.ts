/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MONGO_URI: string;
  readonly MONGO_DB_NAME: string;
  readonly DATABASE_URL: string;
  readonly OBJECT_STORAGE_ACCESS_KEY: string;
  readonly OBJECT_STORAGE_SECRET_KEY: string;
  readonly OBJECT_STORAGE_ENDPOINT: string;
  readonly ENABLE_PLAYGROUND: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
