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
  image: String?,
  background_image: String?,
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
  image: Object?,  // SizedImage (xs, sm, md, lg, xl, source) - PRIMA IMPLEMENTAZIONE: String
  video_full: Object?,  // VideoFull (url, url_mp4, duration, width, height, public, podcast, meride_embed_id) - PRIMA IMPLEMENTAZIONE: String
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
  itinerary_image: Object?,  // SizedImage - PRIMA IMPLEMENTAZIONE: String
  
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
  image: Object?,  // SizedImage (xs, sm, md, lg, xl, source) - PRIMA IMPLEMENTAZIONE: String
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
- Tag include campo `image` per icona/immagine rappresentativa
- `image` sarà SizedImage completo in future versioni, String semplice nella prima implementazione

---

## Strutture Embedded (Oggetti Complessi)

### VideoFull
Oggetto per gestire i video completi.

**Struttura:**
```javascript
{
  url: String,              // URL video principale
  url_mp4: String?,         // URL file MP4 (alternativo)
  duration: Number?,        // Durata in secondi
  width: Number?,           // Larghezza video
  height: Number?,          // Altezza video
  public: Boolean?,         // Se pubblico
  podcast: Boolean?,        // Se è podcast
  meride_embed_id: String?  // ID embed Meride (piattaforma video)
}
```

**Nota implementazione:**
- **Prima versione CMS**: campo `video_full` sarà String semplice (URL diretto YouTube/Vimeo)
- **Versioni successive**: oggetto completo con metadata

---

### SizedImage
Oggetto per gestire immagini responsive con formati multipli.

**Struttura:**
```javascript
{
  xs: { url: String },      // Extra small (mobile)
  sm: { url: String },      // Small (tablet portrait)
  md: { url: String },      // Medium (tablet landscape)
  lg: { url: String },      // Large (desktop)
  xl: { url: String },      // Extra large (desktop HD)
  source: { url: String }   // Immagine originale
}
```

**Nota implementazione:**
- **Prima versione CMS**: campi `image`, `itinerary_image` saranno String semplici (URL diretto)
- **Versioni successive**: upload immagini con generazione automatica dei 6 formati

---

## Prossimi Step
1. ✅ Author + Article base (APPIATTITO)
2. ✅ Category + Tag (collections con references many-to-many)
3. ⏳ Page + PageSection (embedded sections)
4. ⏳ Adv (Advertising)
5. ⏳ AppSettings (singolo documento)
6. ⏳ PurchaseItem + RememberItem (gestione acquisti - fase successiva)

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
- ✅ Struttura `SizedImage` mantenuta (xs, sm, md, lg, xl, source) - **PRIMA IMPLEMENTAZIONE: String semplice**
- ✅ Struttura `VideoFull` mantenuta (url, url_mp4, duration, etc.) - **PRIMA IMPLEMENTAZIONE: String semplice**
- ✅ Tutti i campi title/body separati mantenuti (8 sezioni)
- ✅ Campo `type_of_trip_items` mantenuto (mappa caratteristiche viaggio)
- ✅ Campo `description_HTML` REMEMBER mantenuto
- ✅ Campi `trip_start_at_description` e `trip_end_at_description` mantenuti
- ✅ Struttura prezzi appiattita al primo livello (da nested a flat con prefissi `price_*` e `travelers_*`)
- ✅ Mantenuto `optional_products[]` per prodotti con prezzi differenziati
- ✅ Mantenuto `itinerary_items[]` per tappe viaggio

**Note implementazione:**
- Nella **prima versione** del CMS, i campi `image`, `video_full`, `itinerary_image` saranno implementati come **String** semplici (URL diretti)
- In **versioni successive** si implementerà il caricamento immagini con generazione automatica di formati multipli (xs, sm, md, lg, xl)
