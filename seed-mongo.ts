import 'dotenv/config';
import { createAuthor, getAuthorByEmail } from './src/data/author';
import { createTag, getAllTags } from './src/data/tag';
import { createCategory, getAllCategories } from './src/data/category';
import { createArticle, getAllArticles } from './src/data/article';
import { ObjectId } from 'mongodb';

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Check if author already exists
  const existingAuthor = await getAuthorByEmail('davide.cocco@example.com');
  
  if (!existingAuthor) {
    // Create initial admin author
  const author = await createAuthor({
    name: 'Davide Cocco',
    nickname: 'coccus',
    email: 'davide.cocco@example.com',
    bio: 'Full Stack Developer & Travel Enthusiast',
    is_admin: true,
    is_tour_leader: false,
    social: [
      {
        type: 'linkedin',
        url: 'https://linkedin.com/in/davidecocco',
      }
    ],
    languages: ['it', 'en'],
  });
  
    console.log('✅ Created author:', author.name);
  } else {
    console.log('✅ Author already exists:', existingAuthor.name);
  }
  
  const author = existingAuthor || await getAuthorByEmail('davide.cocco@example.com');
  
  // Create tags if they don't exist
  const existingTags = await getAllTags();
  if (existingTags.length === 0) {
    const tags = [
    { name: 'Avventura', description: 'Viaggi avventurosi e attività outdoor' },
    { name: 'Relax', description: 'Destinazioni per rilassarsi e rigenerarsi' },
    { name: 'Cultura', description: 'Esperienze culturali e visite storiche' },
    { name: 'Mare', description: 'Destinazioni balneari e costiere' },
    { name: 'Montagna', description: 'Escursioni e soggiorni in montagna' },
    { name: 'Città', description: 'City break e tour urbani' },
  ];
  
    const createdTags = [];
    for (const tagData of tags) {
      const tag = await createTag(tagData);
      createdTags.push(tag);
      console.log('✅ Created tag:', tag.name);
    }
  } else {
    console.log('✅ Tags already exist:', existingTags.length);
  }
  
  const tags = await getAllTags();
  
  // Create categories if they don't exist
  const existingCategories = await getAllCategories();
  if (existingCategories.length === 0) {
    const categories = [
    { name: 'Europa', description: 'Destinazioni europee' },
    { name: 'Asia', description: 'Destinazioni asiatiche' },
    { name: 'America', description: 'Destinazioni americane' },
    { name: 'Africa', description: 'Destinazioni africane' },
    { name: 'Oceania', description: 'Destinazioni oceaniche' },
    { name: 'Italia', description: 'Destinazioni in Italia' },
  ];
  
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await createCategory(categoryData);
      createdCategories.push(category);
      console.log('✅ Created category:', category.name);
    }
  } else {
    console.log('✅ Categories already exist:', existingCategories.length);
  }
  
  const categories = await getAllCategories();
  
  // Create articles if they don't exist
  const { client } = await import('./src/lib/mongodb');
  const db = client.db('traveltag');
  const articlesCount = await db.collection('articles').countDocuments();
  console.log(`📊 Found ${articlesCount} articles in DB`);
  
  if (articlesCount === 0 && author && tags.length > 0 && categories.length > 0) {
    const articles = [
    // REMEMBER article
    {
      type: 'REMEMBER' as const,
      title: 'Le meraviglie di Parigi: guida completa',
      slug: 'meraviglie-parigi-guida',
      subtitle: 'Tutto quello che devi sapere per visitare la Ville Lumière',
      excerpt: 'Una guida completa per scoprire i luoghi più iconici di Parigi, dai musei ai caffè storici.',
      author_id: new ObjectId(author._id),
      tour_leader_id: new ObjectId(author._id),
      status: 'PUBLISHED' as const,
      published_date: new Date('2026-01-10'),
      image_hero: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      tag_ids: [new ObjectId(tags[2]._id), new ObjectId(tags[5]._id)], // Cultura, Città
      category_ids: [new ObjectId(categories[0]._id)], // Europa
    },
    // BOOK_NOW article - Weekend in Toscana
      {
        type: 'BOOK_NOW' as const,
        title: 'Weekend in Toscana tra vino e borghi medievali',
        slug: 'weekend-toscana-vino-borghi',
        subtitle: 'Un viaggio di 3 giorni tra le colline toscane',
        excerpt: 'Scopri la Toscana più autentica con questo tour enogastronomico tra Siena, San Gimignano e Montepulciano.',
        author_id: new ObjectId(author._id),
        tour_leader_id: new ObjectId(author._id),
        status: 'PUBLISHED' as const,
      published_date: new Date('2026-01-09'),
      image_hero: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
      tag_ids: [new ObjectId(tags[1]._id), new ObjectId(tags[2]._id)], // Relax, Cultura
      category_ids: [new ObjectId(categories[5]._id)], // Italia
        
      // BOOK_NOW specific fields
      trip_start_at: new Date('2026-05-15'),
      trip_end_at: new Date('2026-05-17'),
      trip_start_at_description: 'Partenza da Firenze',
      trip_end_at_description: 'Rientro a Firenze',
      max_booking_num: 12,
      
      // Prices and travelers
        travelers_adults_allowed: true,
        travelers_adults_min: 1,
        travelers_adults_max: 2,
        price_adults: 450.00,
        
        travelers_children_allowed: false,
        
        travelers_couples_allowed: true,
        travelers_couples_min: 1,
        travelers_couples_max: 1,
        price_couples: 800.00,
        
        travelers_newborns_allowed: false,
        
        // Itinerary
        itinerary_items: [
          {
            order: 1,
            title: 'Giorno 1 - Siena',
            content: 'Arrivo a Siena e visita guidata del centro storico. Nel pomeriggio degustazione di vini locali.'
          },
          {
            order: 2,
            title: 'Giorno 2 - San Gimignano',
            content: 'Escursione a San Gimignano, la città delle torri. Pranzo tipico e visita di una cantina.'
          },
          {
            order: 3,
            title: 'Giorno 3 - Montepulciano',
            content: 'Mattinata a Montepulciano con degustazione del Vino Nobile. Rientro nel pomeriggio.'
          }
        ],
        
        // Optional products
        optional_products: [
          {
            id: 'hotel',
            title: 'Camera doppia superior',
            description: 'Upgrade a camera superior con vista sulle colline',
            price_adults: 50.00,
            price_couples: 80.00,
            refundable: true,
            optional: true
          },
          {
            id: 'vitto',
            title: 'Cena gourmet',
            description: 'Cena degustazione in ristorante stellato',
            price_adults: 75.00,
            price_couples: 140.00,
            refundable: false,
            optional: true
          }
        ],
        
        trip_in_a_nutshell_title: 'Il tour in breve',
        trip_in_a_nutshell_body_HTML: '<p>Un weekend indimenticabile alla scoperta della Toscana più autentica, tra borghi medievali, vigneti e sapori tradizionali.</p>',
        
        included_in_the_price_title: 'Cosa è incluso',
        included_in_the_price_body_HTML: '<ul><li>2 notti in hotel 4 stelle</li><li>Colazioni</li><li>Trasporti con minibus</li><li>Guide turistiche</li><li>Degustazioni vino</li></ul>',
        
        additional_information_title: 'Informazioni aggiuntive',
        additional_information_body_HTML: '<p>Portare scarpe comode per le passeggiate. Il tour si svolge anche in caso di pioggia.</p>',
        
        how_we_move_title: 'Come ci muoviamo',
        how_we_move_body_HTML: '<p>Minibus privato con aria condizionata e autista professionista.</p>',
        
        where_we_sleep_title: 'Dove dormiamo',
        where_we_sleep_body_HTML: '<p>Hotel 4 stelle nel centro di Siena con colazione inclusa.</p>',
        
        type_of_trip_title: 'Tipo di viaggio',
        type_of_trip_body_HTML: '<p>Tour enogastronomico con guida esperta in cultura toscana.</p>',
        
        type_of_trip_items: new Map([
          ['Tipo', 'Tour guidato'],
          ['Stile', 'Enogastronomico'],
          ['Livello', 'Facile']
        ])
      },
      // BOOK_NOW article - Trekking in Nepal
      {
        type: 'BOOK_NOW' as const,
        title: 'Trekking al Campo Base dell\'Everest',
        slug: 'trekking-campo-base-everest',
        subtitle: 'Un\'avventura indimenticabile ai piedi della montagna più alta del mondo',
        excerpt: '14 giorni di trekking in Nepal per raggiungere il Campo Base dell\'Everest a 5364 metri.',
        author_id: new ObjectId(author._id),
        tour_leader_id: new ObjectId(author._id),
        status: 'PUBLISHED' as const,
      published_date: new Date('2026-01-08'),
      image_hero: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
      tag_ids: [new ObjectId(tags[0]._id), new ObjectId(tags[4]._id)], // Avventura, Montagna
      category_ids: [new ObjectId(categories[1]._id)], // Asia
        
      // BOOK_NOW specific fields
      trip_start_at: new Date('2026-10-01'),
      trip_end_at: new Date('2026-10-14'),
      trip_start_at_description: 'Partenza da Roma Fiumicino',
      trip_end_at_description: 'Rientro a Roma Fiumicino',
      max_booking_num: 10,
      
      // Prices and travelers
        travelers_adults_allowed: true,
        travelers_adults_min: 1,
        travelers_adults_max: 2,
        price_adults: 2800.00,
        
        travelers_children_allowed: false,
        travelers_couples_allowed: false,
        travelers_newborns_allowed: false,
        
        // Itinerary
        itinerary_items: [
          {
            order: 1,
            title: 'Giorni 1-2 - Kathmandu',
            content: 'Arrivo a Kathmandu, briefing e preparazione materiali. Visita della città.'
          },
          {
            order: 2,
            title: 'Giorni 3-7 - Trekking verso Namche Bazaar',
            content: 'Volo per Lukla e inizio trekking. Acclimatamento a Namche Bazaar (3440m).'
          },
          {
            order: 3,
            title: 'Giorni 8-10 - Verso il Campo Base',
            content: 'Attraverso Dingboche e Lobuche fino al Campo Base (5364m).'
          },
          {
            order: 4,
            title: 'Giorni 11-13 - Ritorno',
            content: 'Discesa verso Lukla con pernottamenti intermedi.'
          },
          {
            order: 5,
            title: 'Giorno 14 - Kathmandu',
            content: 'Volo da Lukla a Kathmandu e partenza per l\'Italia.'
          }
        ],
        
        // Optional products
        optional_products: [
          {
            id: 'assicurazione',
            title: 'Assicurazione viaggio completa',
            description: 'Include annullamento, spese mediche e evacuazione elicottero',
            price_adults: 280.00,
            refundable: false,
            optional: false
          },
          {
            id: 'biglietti',
            title: 'Volo interno Kathmandu-Lukla A/R',
            description: 'Volo panoramico incluso nel tour',
            price_adults: 350.00,
            refundable: false,
            optional: false
          }
        ],
        
        trip_in_a_nutshell_title: 'L\'avventura',
        trip_in_a_nutshell_body_HTML: '<p>Il trekking al Campo Base dell\'Everest è uno dei percorsi più iconici al mondo. Camminerai sulle orme dei grandi alpinisti attraverso paesaggi mozzafiato.</p>',
        
        highlights_title: 'Preparazione fisica',
        highlights_body_HTML: '<p>È richiesta una buona preparazione fisica. Consigliamo allenamento di almeno 3 mesi prima della partenza con escursioni in montagna.</p>',
        
        additional_information_title: 'Informazioni aggiuntive',
        additional_information_body_HTML: '<p>Necessario passaporto valido 6 mesi. Visto turistico Nepal ottenibile all\'arrivo. Vaccinazioni consigliate.</p>',
        
        how_we_move_title: 'Come ci muoviamo',
        how_we_move_body_HTML: '<p>Trekking a piedi con porter per trasporto bagagli. Voli interni con compagnie locali.</p>',
        
        where_we_sleep_title: 'Dove dormiamo',
        where_we_sleep_body_HTML: '<p>Lodge e tea house lungo il percorso. Hotel a Kathmandu.</p>',
        
        type_of_trip_title: 'Tipo di viaggio',
        type_of_trip_body_HTML: '<p>Trekking di alta quota con guida sherpa certificata e porter di supporto.</p>',
        
        type_of_trip_items: new Map([
          ['Tipo', 'Trekking'],
          ['Difficoltà', 'Impegnativo'],
          ['Quota max', '5364m']
        ])
      }
    ];
  
    for (const articleData of articles) {
      const article = await createArticle(articleData as any);
      console.log('✅ Created article:', article.title, `(${article.type})`);
    }
  } else {
    console.log('✅ Articles already exist:', articlesCount);
  }
  
  console.log('\n✨ Seeding completed!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
