# Nuovo Modello Database - MongoDB (Semplificato)

## Obiettivo
Ridisegnare il modello database partendo dalla struttura Firestore esistente, utilizzando MongoDB con struttura appiattita per massima semplicità ed efficienza.

---

## Step 1: Author & Article (Base Models)

### Author Collection
Collezione per gli autori dei contenuti.

**Struttura documento:**
```javascript
{
  _id: ObjectId,
  name: String,
  nickname: String?,
  email: String,  // unique index
  image_media_id: ObjectId?,  // ref → Media (type=image)
  background_image_media_id: ObjectId?,  // ref → Media (type=image)
  bio: String?,
  is_admin: Boolean,  // default: false
  is_tour_leader: Boolean?,
  
  // Array embedded
  social: [
    {
      type: String,  // "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok"
      url: String
    }
  ],
  languages: [String],  // ["it", "en", "es", "fr", "de"]
  
  created_at: Date,
  updated_at: Date
}
```

**Indici:**
- `email`: unique
- `is_admin`: per filtrare amministratori

**Regole di business:**
- Solo utenti con `is_admin: true` possono modificare il campo `is_admin` di altri autori
- Solo utenti con `is_admin: true` possono modificare il campo `tour_leader_id` negli articoli BOOKING

**Note:**
- `social` e `languages` sono embedded arrays
- Aggiunto campo `is_admin` per distinguere amministratori

---

### Article Collection
Collezione principale per gli articoli. Single collection con discriminazione tramite `type`.

**Struttura documento:**

#### Campi Comuni (sempre presenti)
```javascript
{
  _id: ObjectId,
  author_id: ObjectId,  // ref → Author
  title: String,
  subtitle: String?,
  description: String,
  image_media_id: ObjectId?,  // ref → Media (type=image)
  image_hero_media_id: ObjectId?,  // ref → Media (type=image)
  video_full_media_id: ObjectId?,  // ref → Media (type=video)
  slug: String,  // unique index
  type: String,  // "REMEMBER" | "BOOK_NOW"
  tag_ids: [ObjectId],  // array di ref → Tag
  category_id: Number?,  // ref → Category (int)
  published: Boolean,  // default: false
  published_date: Date,
  created_at: Date,
  updated_at: Date,
```

#### Campi REMEMBER (nullable se type="BOOK_NOW")
```javascript
  // REMEMBER only
  date: Date?,
  description_HTML: String?,  // Descrizione HTML completa
  indicative_price: String?,  // es: "€500-800"
```

#### Campi BOOKING (nullable se type="REMEMBER")
```javascript
  // BOOKING only - Date viaggio
  trip_start_at: Date?,
  trip_end_at: Date?,
  trip_start_at_description: String?,  // Descrizione testuale data inizio
  trip_end_at_description: String?,  // Descrizione testuale data fine
  
  // BOOKING only - Tour Leader
  tour_leader_id: ObjectId?,  // ref → Author (default: author_id)
  
  // BOOKING only - Stripe
  stripe_product_id: String?,
  stripe_price_id: String?,
  
  // BOOKING only - Limiti prenotazione
  max_booking_num: Number?,
  
  // BOOKING only - Prezzi base (primo livello - APPIATTITI)
  price_adults: Number?,
  price_children: Number?,
  price_couples: Number?,
  price_newborns: Number?,
  
  // BOOKING only - Configurazione viaggiatori (primo livello - APPIATTITI)
  travelers_adults_allowed: Boolean?,
  travelers_adults_min: Number?,
  travelers_adults_max: Number?,
  travelers_children_allowed: Boolean?,
  travelers_children_min: Number?,
  travelers_children_max: Number?,
  travelers_couples_allowed: Boolean?,
  travelers_couples_min: Number?,
  travelers_couples_max: Number?,
  travelers_newborns_allowed: Boolean?,
  travelers_newborns_min: Number?,
  travelers_newborns_max: Number?,
  
  // BOOKING only - Immagine itinerario
  itinerary_image_media_id: ObjectId?,  // ref → Media (type=image)
  
  // BOOKING only - Prodotti opzionali (array embedded)
  optional_products: [
    {
      id: String,  // Enum: "volo" | "hotel" | "vitto" | "biglietti" | "assicurazione" | "altro" | "volo2" | "hotel2" | "vitto2" | "biglietti2" | "assicurazione2" | "altro2"
      title: String,
      description: String,
      refundable: Boolean,
      optional: Boolean,
      price_adults: Number,
      price_children: Number,
      price_couples: Number,
      price_newborns: Number
    }
  ],
  
  // BOOKING only - Sezioni contenuto (campi separati come originale)
  trip_in_a_nutshell_title: String?,
  trip_in_a_nutshell_body_HTML: String?,
  highlights_title: String?,
  highlights_body_HTML: String?,
  additional_information_title: String?,
  additional_information_body_HTML: String?,
  how_we_move_title: String?,
  how_we_move_body_HTML: String?,
  where_we_sleep_title: String?,
  where_we_sleep_body_HTML: String?,
  not_included_in_the_price_title: String?,
  not_included_in_the_price_body_HTML: String?,
  included_in_the_price_title: String?,
  included_in_the_price_body_HTML: String?,
  type_of_trip_title: String?,
  type_of_trip_body_HTML: String?,
  type_of_trip_items: Object?,  // Mappa {"Comfort": "5", "Adattamento": "3"} - caratteristiche viaggio con rating
  
  // BOOKING only - Itinerario (array embedded)
  itinerary_items: [
    {
      order: Number,
      title: String,
      content: String  // HTML description
    }
  ]
}
```

**Indici:**
- `slug`: unique
- `author_id`: per query articoli per autore
- `type`: per filtrare REMEMBER vs BOOK_NOW
- `published`: per articoli pubblicati
- `published_date`: per ordinamento
- `tag_ids`: multikey index per ricerca per tag
- `category_id`: per filtrare per categoria

**Enum types:**

**Social.type:**
- `instagram`
- `facebook`
- `twitter`
- `linkedin`
- `tiktok`

**Article.type:**
- `REMEMBER`
- `BOOK_NOW`

**Product.id (optional_products):**
- `volo` - Volo
- `hotel` - Hotel
- `vitto` - Vitto (pasti)
- `biglietti` - Biglietti (tickets)
- `assicurazione` - Assicurazione
- `altro` - Altro
- `volo2` - Volo 2
- `hotel2` - Hotel 2
- `vitto2` - Vitto 2
- `biglietti2` - Biglietti 2
- `assicurazione2` - Assicurazione 2
- `altro2` - Altro 2

**Validazione Schema MongoDB:**
```javascript
{
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "type", "author_id", "slug"],
    properties: {
      type: { enum: ["REMEMBER", "BOOK_NOW"] },
      "optional_products.id": { 
        enum: ["volo", "hotel", "vitto", "biglietti", "assicurazione", "altro", 
               "volo2", "hotel2", "vitto2", "biglietti2", "assicurazione2", "altro2"] 
      }
    },
    // Conditional validation
    if: { properties: { type: { const: "BOOK_NOW" } } },
    then: {
      required: ["trip_start_at", "trip_end_at"],
      properties: {
        price_adults: { bsonType: "number", minimum: 0 },
        travelers_adults_min: { bsonType: "int", minimum: 0 },
        travelers_adults_max: { bsonType: "int", minimum: 1 }
      }
    }
  }
}
```

---

## Step 2: Category & Tag (Many-to-Many)

### Category Collection
Collezione per le categorie degli articoli.

**Struttura documento:**
```javascript
{
  id: Number,  // Integer ID (compatibility con Firestore)
  name: String,
  slug: String,  // unique index, auto-generato da name
  description: String?,
  created_at: Date,
  updated_at: Date
}
```

**Indici:**
- `id`: primary key (int)
- `slug`: unique

**Relazione con Article:**
- Article ha `category_id` (Number) che referenzia Category.id
- Many-to-Many: un Article può avere una Category, una Category può avere molti Article

**Note:**
- Category usa `id` integer invece di `_id` ObjectId per compatibilità con modello Firestore originale

---

### Tag Collection
Collezione per i tag degli articoli.

**Struttura documento:**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,  // unique index, auto-generato da name
  description: String?,
  image_media_id: ObjectId?,  // ref → Media (type=image)
  created_at: Date,
  updated_at: Date
}
```

**Indici:**
- `_id`: primary key (ObjectId)
- `slug`: unique

**Relazione con Article:**
- Article ha `tag_ids` (Array[ObjectId]) che contiene array di riferimenti a Tag
- Many-to-Many: un Article può avere molti Tag, un Tag può appartenere a molti Article
- No junction table necessaria - MongoDB gestisce array di ObjectId nativamente

**Note:**
- Tag include campo `image_media_id` per icona/immagine rappresentativa (Media SVG)

---

## Strutture Embedded (Oggetti Complessi)

### MediaVideo
Oggetto per gestire i video e salvare le reference ai formati.

**Struttura:**
```javascript
{
  path: String,             // Path relativo (es. "videos/video.mp4")
  formats: {
    m3u: String?,           // URL stream HLS
    mp4: String?            // URL MP4
  }
}
```

**Nota implementazione:**
- Il CMS salva sempre l'oggetto MediaVideo con i formati disponibili

---

### MediaImage
Oggetto per gestire immagini e salvare le reference ai formati.

**Struttura:**
```javascript
{
  path: String,             // Path relativo (es. "images/image.jpg")
  sizes: {
    s: String?,             // URL size small
    xl: String?             // URL size extra large
  }
}
```

**Nota implementazione:**
- Il CMS salva sempre l'oggetto MediaImage con i formati disponibili
- Per SVG (icone Tag) si usa il file originale senza optimizer

---

## Media Library (collection `media`)
Ogni file caricato viene salvato nella libreria media e poi referenziato dalle entità tramite `*_media_id`.

**Struttura documento:**
```javascript
{
  _id: ObjectId,
  type: String,             // "image" | "video"
  file: Object,             // MediaImage | MediaVideo
  original_filename: String?,
  mime_type: String?,
  size: Number?,            // bytes
  title: String?,
  alt: String?,
  author_id: ObjectId?,     // ref → Author
  namespace: String?,       // namespace dell'autore
  created_at: Date,
  updated_at: Date
}
```

**Permessi:**
- Admin vede tutti i media
- Altri utenti vedono solo i media con lo stesso `namespace`

---

## Step 3: Adv (Advertising)

### Adv Collection
Collezione per gestire gli annunci pubblicitari e contenuti promozionali.

**Struttura documento:**
```javascript
{
  _id: ObjectId,
  author_id: ObjectId,  // ref → Author
  title: String,
  subtitle: String?,
  description: String?,
  image_media_id: ObjectId?,  // ref → Media (type=image)
  link: String?,  // URL destinazione click
  type: String?,  // "banner" | "popup" | "sidebar" | "newsletter"
  position: String?,  // "home" | "article" | "category" | "tag"
  priority: Number?,  // 0-10, maggiore = più priorità
  impressions: Number?,  // Contatore visualizzazioni
  clicks: Number?,  // Contatore click
  published: Boolean,  // default: false
  published_date: Date?,
  start_date: Date?,  // Data inizio pubblicazione
  end_date: Date?,  // Data fine pubblicazione
  created_at: Date,
  updated_at: Date
}
```

**Indici:**
- `author_id`: per query advs per autore
- `published`: per advs pubblicati
- `type`: per filtrare per tipo
- `position`: per posizionamento
- `start_date`, `end_date`: per scheduling
- `priority`: per ordinamento

**Enum types:**

**Adv.type:**
- `banner` - Banner pubblicitario
- `popup` - Popup/Modal
- `sidebar` - Barra laterale
- `newsletter` - Newsletter

**Adv.position:**
- `home` - Homepage
- `article` - Pagina articolo
- `category` - Pagina categoria
- `tag` - Pagina tag
- `search` - Risultati ricerca

**Regole di business:**
- Solo utenti con `is_admin: true` possono creare/modificare Adv
- Solo utenti con `is_admin: true` possono modificare il campo `author_id`
- Advs con `start_date` futuro non vengono mostrati
- Advs con `end_date` passato non vengono mostrati
- Ordinamento per `priority` (desc) poi per `published_date` (desc)

---

## Step 4: AppSettings (Configurazione Applicazione)

### AppSettings Collection
Singolo documento per configurazioni globali dell'applicazione.

**Struttura documento:**
```javascript
{
  _id: ObjectId,  // Solo un documento con _id fisso: "app_settings"
  
  // Informazioni sito
  site_name: String,  // "TravelTag"
  site_description: String?,
  site_url: String,  // "https://traveltag.it"
  site_logo_media_id: ObjectId?,  // ref → Media (type=image)
  site_favicon: String?,
  
  // SEO
  meta_title: String?,
  meta_description: String?,
  meta_keywords: [String]?,
  og_image_media_id: ObjectId?,  // ref → Media (type=image)
  
  // Social
  social_facebook: String?,
  social_instagram: String?,
  social_twitter: String?,
  social_youtube: String?,
  social_linkedin: String?,
  social_tiktok: String?,
  
  // Contatti
  contact_email: String?,
  contact_phone: String?,
  contact_address: String?,
  
  // Analytics
  google_analytics_id: String?,
  google_tag_manager_id: String?,
  facebook_pixel_id: String?,
  
  // Stripe
  stripe_publishable_key: String?,
  stripe_secret_key: String?,  // encrypted
  stripe_webhook_secret: String?,  // encrypted
  
  // Email
  smtp_host: String?,
  smtp_port: Number?,
  smtp_user: String?,
  smtp_password: String?,  // encrypted
  email_from: String?,
  email_from_name: String?,
  
  // Funzionalità
  enable_comments: Boolean?,  // default: false
  enable_newsletter: Boolean?,  // default: false
  enable_booking: Boolean?,  // default: true
  maintenance_mode: Boolean?,  // default: false
  
  // Testi standard
  privacy_policy_html: String?,
  terms_and_conditions_html: String?,
  cookie_policy_html: String?,
  
  // Newsletter
  newsletter_provider: String?,  // "mailchimp" | "sendgrid" | "custom"
  newsletter_api_key: String?,  // encrypted
  newsletter_list_id: String?,
  
  // Impostazioni booking
  booking_confirmation_email_template: String?,
  booking_cancellation_hours: Number?,  // ore minime prima cancellazione
  booking_min_travelers: Number?,  // minimo viaggiatori per conferma
  
  created_at: Date,
  updated_at: Date
}
```

**Note:**
- Esiste **un solo documento** in questa collection con `_id` fisso
- Campi sensibili (password, api_key) devono essere **encrypted** prima del salvataggio
- Solo utenti con `is_admin: true` possono modificare AppSettings
- In CMS, form dedicato in sezione "Impostazioni" accessibile solo ad admin

**Validazione:**
- `site_url` deve essere URL valido
- Email devono essere in formato valido
- `booking_cancellation_hours` deve essere >= 0
- Campi Stripe opzionali ma se `enable_booking: true` devono essere compilati

---

## Step 5: Notification (Push Notifications)

### Notification Collection
Collezione per gestire le notifiche push dell'app.

**Struttura documento:**
```javascript
{
  _id: ObjectId,
  
  // Contenuto notifica
  title: String,              // Titolo notifica
  body: String,               // Corpo/messaggio notifica
  image_media_id: ObjectId?,       // ref → Media (type=image)
  
  // Target
  target_type: String,        // "all" | "user" | "segment"
  target_user_ids: [String]?, // Array di user IDs (se target_type = "user")
  target_segment: String?,    // Segmento utenti (se target_type = "segment")
                              // Esempi: "tour_leaders", "admins", "active_users"
  
  // Deep linking / azione
  action_type: String?,       // "article" | "author" | "category" | "tag" | "url" | "none"
  action_id: String?,         // ID risorsa (es. article_id, author_id, etc.)
  action_url: String?,        // URL custom (se action_type = "url")
  
  // Scheduling
  scheduled_at: Date?,        // Data/ora programmata invio (null = invio immediato)
  sent_at: Date?,             // Data/ora effettivo invio
  
  // Metadata
  status: String,             // "draft" | "scheduled" | "sent" | "failed"
  sent_count: Number,         // Numero notifiche inviate con successo
  failed_count: Number,       // Numero notifiche fallite
  
  // Autore
  author_id: ObjectId,        // Riferimento all'autore che ha creato la notifica
  
  // Timestamp
  created_at: Date,
  updated_at: Date
}
```

**Indici:**
- `status`: per filtrare bozze/programmate/inviate
- `scheduled_at`: per job di invio programmato
- `author_id`: per filtrare notifiche per autore
- `created_at`: per ordinamento cronologico

**Enum Values:**
```javascript
// target_type
"all"       // Invia a tutti gli utenti
"user"      // Invia a utenti specifici
"segment"   // Invia a segmento utenti

// action_type
"article"   // Apri articolo specifico
"author"    // Apri profilo autore
"category"  // Apri categoria
"tag"       // Apri tag
"url"       // Apri URL custom
"none"      // Nessuna azione (solo notifica)

// status
"draft"     // Bozza
"scheduled" // Programmata
"sent"      // Inviata
"failed"    // Fallita
```

**Regole di business:**
- Solo admin possono creare/modificare notifiche
- Notifiche "sent" non possono essere modificate
- `sent_at` viene impostato automaticamente al momento dell'invio
- `sent_count` e `failed_count` vengono aggiornati dopo l'invio
- Se `scheduled_at` è null, la notifica viene inviata immediatamente
- Se `scheduled_at` è nel futuro, la notifica viene programmata

**Note implementazione:**
- L'invio effettivo sarà gestito tramite Firebase Cloud Messaging (FCM)
- Il CMS gestisce solo la creazione/programmazione delle notifiche
- Un job periodico o webhook invierà le notifiche programmate
- Gli `fcm_token` degli utenti sono memorizzati nella collezione `users`

---

## Prossimi Step
1. ✅ Author + Article base (APPIATTITO)
2. ✅ Category + Tag (collections con references many-to-many)
3. ✅ Adv (Advertising)
4. ✅ AppSettings (singolo documento)
5. ✅ Notification (notifiche push)
6. ⏳ Page + PageSection (embedded sections)
7. ⏳ PurchaseItem + RememberItem (gestione acquisti - fase successiva)

---

## Decisioni Architetturali MongoDB

### Struttura Appiattita (Flat)

**PRIMO LIVELLO** (campi diretti in Article):
- ✅ Prezzi: `price_currency`, `price_adults`, `price_children`, etc.
- ✅ Configurazione viaggiatori: `travelers_adults_allowed`, `travelers_adults_min`, etc.
- ✅ Campi semplici: `trip_start_at`, `max_booking_num`, etc.

**ARRAY EMBEDDED** (unico livello di nesting):
- ✅ `optional_products[]` - prodotti opzionali con prezzi
- ✅ `sections[]` - contenuti HTML flessibili
- ✅ `itinerary_items[]` - tappe del viaggio
- ✅ `social[]` (Author) - social network

**REFERENCED (collections separate):**
- ✅ `Author` → collection separata (riutilizzabile)
- ✅ `Tag` → collection separata (many-to-many tramite array)
- ✅ `Category` → collection separata (many-to-many tramite reference)
- ✅ `Article.author_id` → ObjectId reference (one-to-many)
- ✅ `Article.tag_ids` → Array[ObjectId] (many-to-many con Tag)
- ✅ `Article.category_id` → Number reference (many-to-many con Category)

**Many-to-Many in MongoDB:**
- **Tag**: gestito con array `tag_ids` direttamente in Article
- **Category**: gestito con campo `category_id` singolo in Article (un articolo può avere una sola categoria principale)
- Nessuna junction table necessaria - MongoDB supporta array nativamente
- Query con `$in` operator: `db.articles.find({ tag_ids: { $in: [tagId] } })`
- Populate manuale o aggregation pipeline per ottenere dettagli completi

### Vantaggi Struttura Appiattita

✅ **Query semplificate**: `{ price_adults: { $gt: 1000 } }` invece di `{ "pricing.base_prices.adults": { $gt: 1000 } }`
✅ **Indici più efficienti**: campi diretti indicizzabili
✅ **Form più facili**: binding diretto ai campi
✅ **Meno complessità**: nessun nesting profondo
✅ **Validazione chiara**: campi espliciti con prefissi semantici

### Semplificazioni Applicate

**Rispetto al modello Firestore originale:**
- ✅ Mantenuti TUTTI i campi originali
- ✅ Struttura `MediaImage` con `path` e `sizes` (s, xl)
- ✅ Struttura `MediaVideo` con `path` e `formats` (m3u, mp4)
- ✅ Tutti i campi title/body separati mantenuti (8 sezioni)
- ✅ Campo `type_of_trip_items` mantenuto (mappa caratteristiche viaggio)
- ✅ Campo `description_HTML` REMEMBER mantenuto
- ✅ Campi `trip_start_at_description` e `trip_end_at_description` mantenuti
- ✅ Struttura prezzi appiattita al primo livello (da nested a flat con prefissi `price_*` e `travelers_*`)
- ✅ Mantenuto `optional_products[]` per prodotti con prezzi differenziati
- ✅ Mantenuto `itinerary_items[]` per tappe viaggio

**Note implementazione:**
- I campi media salvano sempre `*_media_id` che referenzia la libreria media
- In **versioni successive** si potranno aggiungere nuovi formati in `sizes`/`formats` senza cambiare il modello
