import 'dotenv/config';
import { client } from './src/lib/mongodb';

async function verify() {
  const db = client.db('traveltag');
  
  const bookNow = await db.collection('articles').findOne({ type: 'BOOK_NOW' });
  
  if (bookNow) {
    console.log('📄 BOOK_NOW Article Fields:\n');
    console.log('Base fields:', Object.keys(bookNow).filter(k => !k.includes('_')).join(', '));
    console.log('\nContent sections:');
    const sections = Object.keys(bookNow).filter(k => k.includes('_title') || k.includes('_body_HTML'));
    sections.forEach(s => {
      if (bookNow[s]) console.log(`  ✅ ${s}`);
    });
    
    // Check for old wrong fields
    const wrongFields = Object.keys(bookNow).filter(k => k.startsWith('title_section_') || k.startsWith('body_HTML_section_'));
    if (wrongFields.length > 0) {
      console.log('\n❌ Found wrong fields:', wrongFields.join(', '));
    } else {
      console.log('\n✅ No wrong fields found!');
    }
  }
  
  await client.close();
  process.exit(0);
}

verify().catch(console.error);
