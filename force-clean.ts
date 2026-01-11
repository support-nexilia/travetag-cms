import 'dotenv/config';
import { client } from './src/lib/mongodb';

async function forceReseed() {
  const db = client.db('traveltag');
  
  console.log('📊 Before:');
  let count = await db.collection('articles').countDocuments();
  console.log(`   Articles: ${count}`);
  
  console.log('\n🗑️  Dropping collection...');
  await db.collection('articles').drop().catch(() => console.log('   Collection did not exist'));
  
  console.log('\n📊 After drop:');
  count = await db.collection('articles').countDocuments();
  console.log(`   Articles: ${count}`);
  
  console.log('\n✅ Done');
  process.exit(0);
}

forceReseed().catch(console.error);
