import 'dotenv/config';
import { db } from './src/lib/mongodb';

async function countArticles() {
  const count = await db.collection('articles').countDocuments();
  console.log('Articles count:', count);
  process.exit(0);
}

countArticles().catch(console.error);
