import { MongoClient, Db } from 'mongodb';
import { IS_PROD, MONGO_DB_NAME, MONGO_URI } from '@/lib/env';

const uri = MONGO_URI;
const dbName = MONGO_DB_NAME;

if (!uri) {
  throw new Error('MONGO_URI environment variable is not defined');
}

if (!dbName) {
  throw new Error('MONGO_DB_NAME environment variable is not defined');
}

// Global MongoDB client for reuse across requests
const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
};

let client: MongoClient;
let db: Db;

const isProd = IS_PROD;

if (isProd) {
  client = new MongoClient(uri);
  db = client.db(dbName);
} else {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri);
    globalForMongo.mongoDb = globalForMongo.mongoClient.db(dbName);
  }
  client = globalForMongo.mongoClient;
  db = globalForMongo.mongoDb;
}

export { client, db };

// Collections with db reference
export const collections = {
  db, // Export db for custom collections
  authors: db.collection('authors'),
  articles: db.collection('articles'),
  tags: db.collection('tags'),
  categories: db.collection('categories'),
  users: db.collection('users'),
  media: db.collection('media'),
  cronJobs: db.collection('cron_jobs'),
} as const;
