import 'dotenv/config';
import { client } from './src/lib/mongodb';

async function check() {
  const db = client.db('traveltag');
  
  console.log('📊 Direct query:');
  const articles = await db.collection('articles').find({}).toArray();
  console.log(`   Articles found: ${articles.length}`);
  
  if (articles.length > 0) {
    console.log('\n📄 First article fields:');
    console.log(Object.keys(articles[0]));
  }
  
  process.exit(0);
}

check().catch(console.error);
