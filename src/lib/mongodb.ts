import { MongoClient, Db } from 'mongodb';

const uri = (typeof import.meta !== 'undefined' && import.meta.env?.MONGO_URI) || process.env.MONGO_URI;
const dbName = (typeof import.meta !== 'undefined' && import.meta.env?.MONGO_DB_NAME) || process.env.MONGO_DB_NAME;

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

const isProd = (typeof import.meta !== 'undefined' && import.meta.env?.PROD) || process.env.NODE_ENV === 'production';

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
} as const;
