import 'dotenv/config';
import { collections } from './src/lib/mongodb';

async function cleanArticles() {
  console.log('🗑️  Removing all articles...');
  const result = await collections.articles.deleteMany({});
  console.log(`✅ Removed ${result.deletedCount} articles`);
  
  process.exit(0);
}

cleanArticles().catch(console.error);
