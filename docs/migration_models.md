# Modelli di Dati - TravelTag

Questo documento sintetizza tutti i modelli di dati utilizzati nel progetto Flutter TravelTag e i loro campi.

## Indice
1. [User](#user)
2. [PublicUser](#publicuser)
3. [Article](#article)
4. [Author](#author)
5. [Adv](#adv)
6. [Tag](#tag)
7. [Page](#page)
8. [AppSettings](#appsettings)
9. [PurchaseItem](#purchaseitem)
10. [RememberItem](#rememberitem)
11. [Modelli di Supporto](#modelli-di-supporto)

---

## User

**Collezione Firestore:** `users`

### AppUser

Modello principale per gli utenti dell'applicazione.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | Sì | ID univoco dell'utente (document ID) |
| `role` | String? | Sì | Ruolo utente (admin, creator, user) |
| `email` | String? | No | Email dell'utente |
| `settings` | AppUserSettings? | Sì | Impostazioni utente |
| `status` | String? | No | Stato dell'utente |
| `name` | String? | No | Nome |
| `surname` | String? | No | Cognome |
| `phone` | String? | No | Numero di telefono |
| `phone_verified` | bool? | No | Telefono verificato |
| `fcm_token` | String? | No | Token FCM per notifiche push |
| `image` | SizedImage? | No | Immagine profilo |

**Proprietà calcolate:**
- `mappedName`: Nome completo (name + surname)
- `roleType`: Enum UserRoles (admin, creator, user)
- `userStatus`: Enum UserStatus (disabled, created, profiled, verified)
- `isCreated`: true se id != null
- `isProfiled`: true se isCreated && email non vuoto
- `isVerified`: true se isProfiled && phone non vuoto && phoneVerified == true
- `mainPhoto`: URL immagine principale

### AppUserSettings

Impostazioni dell'utente.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `theme` | String? | No | Tema (light/dark) |
| `notifications` | Map<String,bool>? | No | Mappa notifiche abilitate/disabilitate |
| `onboard` | bool? | No | Flag onboarding completato (default: true) |

### Subcollezioni User

#### Purchases (`users/{userId}/purchases`)

Vedi [PurchaseItem](#purchaseitem)

#### Remember List (`users/{userId}/remember_list`)

Vedi [RememberItem](#rememberitem)

---

## PublicUser

**Collezione Firestore:** Non utilizzata direttamente (probabilmente per profili pubblici)

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID univoco |
| `name` | String? | No | Nome |
| `surname` | String? | No | Cognome |
| `nickname` | String? | No | Nickname |
| `imageUrl` | String? | No | URL immagine profilo |
| `description` | String? | No | Descrizione/biografia |

---

## Article

**Collezione Firestore:** `articles`

Modello base astratto per gli articoli. Due tipi implementati: `RememberArticle` e `BookingArticle`.

### Campi Base (Article)

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | Sì | ID univoco articolo |
| `author` | String? | No | Nome autore (deprecato) |
| `author_id` | String? | No | ID autore |
| `title` | String? | Sì | Titolo articolo |
| `subtitle` | String? | Sì | Sottotitolo |
| `description` | String? | Sì | Descrizione breve |
| `tags` | List<String>? | Sì | Lista ID tag |
| `type` | String? | Sì | Tipo articolo (REMEMBER_ME, BOOK_NOW) |
| `categoryId` | int? | Sì | ID categoria |
| `published_date` | TM? | Sì | Data pubblicazione (Timestamp) |
| `image` | SizedImage? | Sì | Immagine principale |
| `video_full` | VideoFull? | Sì | Video completo |
| `slug` | String? | Sì | Slug URL-friendly |

**Proprietà calcolate:**
- `mainPhoto`: URL immagine principale
- `mainTag`: Primo tag della lista
- `publishedUnix`: Timestamp Unix
- `articleType`: Enum ArticleType
- `articleDate(withYear)`: Data formattata
- `tripDays()`: Numero giorni viaggio (solo BookingArticle)
- `startDate()`: Data inizio (solo BookingArticle)
- `endDate()`: Data fine (solo BookingArticle)

### RememberArticle

Articolo tipo "Remember Me" (contenuto informativo).

**Campi aggiuntivi:**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `date` | TM? | No | Data evento |
| `description_HTML` | String? | No | Descrizione in HTML |
| `indicative_price` | String? | No | Prezzo indicativo |

### BookingArticle

Articolo tipo "Book Now" (viaggio prenotabile).

**Campi aggiuntivi:**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `trip_in_a_nutshell_title` | String? | No | Titolo riassunto viaggio |
| `trip_start_at` | TM? | No | Data inizio viaggio |
| `trip_end_at` | TM? | No | Data fine viaggio |
| `trip_start_at_description` | String? | No | Descrizione data inizio |
| `trip_end_at_description` | String? | No | Descrizione data fine |
| `highlights_title` | String? | No | Titolo highlights |
| `highlights_body_HTML` | String? | No | Corpo highlights HTML |
| `additional_information_title` | String? | No | Titolo info aggiuntive |
| `additional_information_body_HTML` | String? | No | Corpo info aggiuntive HTML |
| `stripe_product_id` | String? | No | ID prodotto Stripe |
| `stripe_price_id` | String? | No | ID prezzo Stripe |
| `how_we_move_title` | String? | No | Titolo sezione trasporti |
| `how_we_move_body_HTML` | String? | No | Corpo sezione trasporti HTML |
| `where_we_sleep_title` | String? | No | Titolo sezione alloggi |
| `where_we_sleep_body_HTML` | String? | No | Corpo sezione alloggi HTML |
| `trip_in_a_nutshell_body_HTML` | String? | No | Corpo riassunto viaggio HTML |
| `not_included_in_the_price_title` | String? | No | Titolo cosa non incluso |
| `not_included_in_the_price_body_HTML` | String? | No | Corpo cosa non incluso HTML |
| `included_in_the_price_title` | String? | No | Titolo cosa incluso |
| `included_in_the_price_body_HTML` | String? | No | Corpo cosa incluso HTML |
| `type_of_trip_title` | String? | No | Titolo tipo viaggio |
| `type_of_trip_body_HTML` | String? | No | Corpo tipo viaggio HTML |
| `type_of_trip_items` | Map<String, String>? | No | Mappa elementi tipo viaggio |
| `max_booking_num` | int? | No | Numero massimo prenotazioni |
| `prices` | Prices? | No | Struttura prezzi complessa |
| `itinerary_image` | SizedImage? | No | Immagine itinerario |
| `itinerary_items` | List<ItineraryItem>? | No | Lista elementi itinerario |

**Proprietà calcolate:**
- `price`: Prezzo totale calcolato
- `forCouples`: Se ammesse coppie
- `forFamilies`: Se ammesse famiglie
- `minCouplePrice`: Prezzo minimo coppie
- `minFamiliesPrice`: Prezzo minimo famiglie
- `maxBooking`: Numero massimo prenotazioni (default da config)
- `optionalProducts`: Lista prodotti opzionali
- `itineraryMainPhoto`: URL immagine itinerario

### ItineraryItem

Elemento dell'itinerario.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `title` | String? | No | Titolo tappa |
| `description_HTML` | String? | No | Descrizione HTML tappa |

### Prices

Struttura complessa per i prezzi dei viaggi.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `traveler_type` | TravelerType? | No | Configurazione tipi viaggiatori |
| `products` | List<Product>? | No | Lista prodotti/prezzi |

### TravelerType

Configurazione tipi viaggiatori ammessi.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `adults` | Traveler? | No | Configurazione adulti |
| `children` | Traveler? | No | Configurazione bambini |
| `couples` | Traveler? | No | Configurazione coppie |
| `newborns` | Traveler? | No | Configurazione neonati |

### Traveler

Configurazione singolo tipo viaggiatore.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `allowed` | bool? | No | Se questo tipo è ammesso |
| `min` | int? | No | Numero minimo |
| `max` | int? | No | Numero massimo |

### Product

Prodotto/servizio incluso nel viaggio.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String | Sì | ID prodotto |
| `title` | String | Sì | Titolo prodotto |
| `description` | String | Sì | Descrizione |
| `refundable` | bool | Sì | Se rimborsabile |
| `optional` | bool | Sì | Se opzionale |
| `prices` | ProductPrices? | Sì | Prezzi per tipo viaggiatore |

### ProductPrices

Prezzi per tipo viaggiatore.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `adults` | num? | No | Prezzo adulti |
| `children` | num? | No | Prezzo bambini |
| `couples` | num? | No | Prezzo coppie |
| `newborns` | num? | No | Prezzo neonati |

---

## Author

**Collezione Firestore:** `authors`

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID univoco autore |
| `is_tour_leader` | bool? | No | Se è tour leader |
| `name` | String? | No | Nome |
| `nickname` | String? | No | Nickname |
| `bio` | String? | No | Biografia |
| `image` | SizedImage? | No | Immagine profilo |
| `background_image` | SizedImage? | No | Immagine di sfondo |
| `social` | List<Social>? | No | Lista social network |
| `languages` | List<String>? | No | Lingue parlate |

**Proprietà calcolate:**
- `mainPhoto`: URL immagine principale
- `mainBackground`: URL immagine sfondo

### Social

Social network dell'autore.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `type` | String? | No | Tipo social (facebook, instagram, etc.) |
| `url` | String? | No | URL profilo |

---

## Adv

**Collezione Firestore:** `advs`

Pubblicità/promozioni.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID univoco |
| `video_full` | VideoFull? | No | Video completo |
| `title` | String? | No | Titolo |
| `subtitle` | String? | No | Sottotitolo |
| `author` | String? | No | Autore (deprecato) |
| `author_id` | String? | No | ID autore |
| `date` | TM? | No | Data |
| `published_date` | TM? | No | Data pubblicazione |
| `image` | SizedImage? | No | Immagine |
| `link` | String? | No | Link esterno |

---

## Tag

**Collezione Firestore:** `tags`

Tag per categorizzare articoli.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID univoco tag |
| `title` | String? | No | Titolo tag |
| `image` | SizedImage? | No | Immagine tag |

**Proprietà calcolate:**
- `mainPhoto`: URL immagine principale

---

## Page

**Collezione Firestore:** `pages`

Pagine statiche/dinamiche dell'app.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID univoco pagina |
| `subtitle` | String? | No | Sottotitolo |
| `description` | String? | No | Descrizione |
| `title` | String? | No | Titolo |
| `image` | SizedImage? | No | Immagine principale |
| `sections` | List<PageSection>? | No | Lista sezioni (subcollezione) |

**Proprietà calcolate:**
- `mainPhoto`: URL immagine principale

### Subcollezione: Sections (`pages/{pageId}/sections`)

### PageSection (Base)

Sezione base astratta.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `order_number` | int? | No | Ordine visualizzazione |
| `type` | String? | No | Tipo sezione (article, traveltaggers, categories) |

### SectionArticle

Sezione con articolo.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `article_id` | String? | No | ID articolo referenziato |

### SectionTraveltaggers

Sezione con lista traveltaggers (autori).

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `traveltaggers` | List<SectionTraveltagger>? | No | Lista traveltaggers |

### SectionTraveltagger

Riferimento a traveltagger.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `author_id` | int? | No | ID autore |

### SectionCategories

Sezione con categorie.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `categories` | List<SectionCategory>? | No | Lista categorie |

### SectionCategory

Riferimento a categoria.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `category_id` | int? | No | ID categoria |

---

## AppSettings

**Collezione Firestore:** `settings` (documento ID: `1`)

Impostazioni globali dell'applicazione.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `minimum_supported_version` | int | No | Versione minima app supportata (default: 0) |
| `traveltaggers_description` | String? | No | Descrizione traveltaggers |
| `refund_within_hours` | int? | No | Ore entro cui rimborso completo |
| `partial_refund_within_hours_of_departure` | int? | No | Ore prima partenza per rimborso parziale |
| `newborns_age` | TypeAge? | No | Range età neonati |
| `children_age` | TypeAge? | No | Range età bambini |
| `main_sections_order` | List<String>? | No | Ordine sezioni home (main, adv, chat) |
| `video_full` | VideoFull? | No | Video principale |

### TypeAge

Range di età.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `min` | int? | No | Età minima |
| `max` | int? | No | Età massima |

---

## PurchaseItem

**Collezione Firestore:** `users/{userId}/purchases`

Prenotazione/acquisto viaggio.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `payment_intent_id` | String? | No | ID payment intent (usato come id) |
| `article_id` | String? | No | ID articolo/viaggio acquistato |
| `payment_date` | TM? | No | Data pagamento |
| `refund_date` | TM? | No | Data rimborso (se presente) |
| `adults_quantity` | int | No | Quantità adulti (default: 0) |
| `couples_quantity` | int | No | Quantità coppie (default: 0) |
| `children_quantity` | int | No | Quantità bambini (default: 0) |
| `newborns_quantity` | int | No | Quantità neonati (default: 0) |
| `products` | List<PurchaseProduct>? | No | Lista prodotti acquistati |
| `optional_products` | List<String>? | No | Lista ID prodotti opzionali |
| `total_amount` | num | No | Importo totale (default: 0.0) |

**Proprietà calcolate:**
- `sortedPurchases`: Lista acquisti ordinata per data pagamento

### PurchaseProduct

Prodotto acquistato.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `title` | String | Sì | Titolo prodotto |
| `description` | String | Sì | Descrizione |
| `refundable` | bool | Sì | Se rimborsabile |
| `optional` | bool | Sì | Se opzionale |
| `travelers` | PurchaseTravelers? | Sì | Dettagli viaggiatori |

### PurchaseTravelers

Dettagli viaggiatori per prodotto.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `adults` | PurchaseTravelerInfo? | No | Info adulti |
| `children` | PurchaseTravelerInfo? | No | Info bambini |
| `couples` | PurchaseTravelerInfo? | No | Info coppie |
| `newborns` | PurchaseTravelerInfo? | No | Info neonati |

### PurchaseTravelerInfo

Informazioni dettagliate per tipo viaggiatore.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `number` | int | Sì | Numero viaggiatori |
| `total` | double | Sì | Totale per questo tipo |
| `unit_price` | double | Sì | Prezzo unitario |

---

## RememberItem

**Collezione Firestore:** `users/{userId}/remember_list`

Articolo salvato nella lista "Remember Me" (wishlist).

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `id` | String? | No | ID elemento |
| `article_id` | String? | No | ID articolo salvato |
| `date` | TM? | No | Data salvataggio |

---

## Modelli di Supporto

### SizedImage

Immagine con formati multipli.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `xs` | ImageFormat? | No | Formato extra small |
| `sm` | ImageFormat? | No | Formato small |
| `md` | ImageFormat? | No | Formato medium |
| `lg` | ImageFormat? | No | Formato large |
| `xl` | ImageFormat? | No | Formato extra large |
| `source` | Source? | No | Immagine sorgente originale |

### ImageFormat

Formato immagine specifico.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `url` | String? | No | URL immagine |

### Source

Immagine sorgente.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `url` | String? | No | URL immagine originale |

### VideoFull

Video completo.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `duration` | double? | No | Durata in secondi |
| `url_mp4` | String? | No | URL file MP4 |
| `public` | bool? | No | Se pubblico |
| `podcast` | bool? | No | Se è podcast |
| `width` | int? | No | Larghezza video |
| `height` | int? | No | Altezza video |
| `url` | String? | No | URL video |
| `meride_embed_id` | String? | No | ID embed Meride |

### Voyagers

Dati viaggiatori per prenotazione.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `adults_quantity` | int | Sì | Quantità adulti |
| `couples_quantity` | int | Sì | Quantità coppie |
| `children_quantity` | int | Sì | Quantità bambini |
| `newborns_quantity` | int | Sì | Quantità neonati |
| `adults_names` | List<Person> | Sì | Nomi adulti |
| `children_names` | List<Person> | Sì | Nomi bambini |
| `couples_names` | List<Person> | Sì | Nomi coppie |
| `newborns_names` | List<Person> | Sì | Nomi neonati |

**Proprietà calcolate:**
- `total`: Totale viaggiatori (adults + children + couples*2, newborns non contano)

### Person

Persona (viaggiatore).

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `name` | String | Sì | Nome |
| `surname` | String | Sì | Cognome |

### PaymentIntentBody

Body per creare payment intent.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `article_id` | String | Sì | ID articolo |
| `optional_products` | Set<String> | Sì | Set ID prodotti opzionali |
| `userForm` | Map<String, dynamic> | Sì | Dati form utente |
| `adults_quantity` | int | Sì | Da voyagers |
| `couples_quantity` | int | Sì | Da voyagers |
| `children_quantity` | int | Sì | Da voyagers |
| `newborns_quantity` | int | Sì | Da voyagers |
| `adults_names` | List | Sì | Da voyagers |
| `children_names` | List | Sì | Da voyagers |
| `couples_names` | List | Sì | Da voyagers |
| `newborns_names` | List | Sì | Da voyagers |

### PaymentCheckoutBody

Body per checkout Stripe.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `article_id` | String? | No | ID articolo |
| `success_url` | String? | No | URL successo |
| `cancel_url` | String? | No | URL annullamento |
| `voyagers` | Voyagers? | No | Dati viaggiatori |

### RefundBody

Body per richiesta rimborso.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `article_id` | String | Sì | ID articolo |
| `payment_intent_id` | String | Sì | ID payment intent |

### ChatTokenResponse

Risposta token chat CometChat.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `token` | ChatTokenData? | No | Dati token |

### ChatTokenData

Dati token chat.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `uid` | String? | No | User ID |
| `authToken` | String? | No | Token autenticazione |
| `createdAt` | int? | No | Timestamp creazione |

### FunctionResponse

Risposta generica da Cloud Function.

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `code` | int? | No | Codice risposta |
| `message` | String? | No | Messaggio |
| `data` | dynamic | No | Dati risposta |

---

## Note Tecniche

### Timestamp (TM)

Il progetto utilizza `TM` come alias per `Timestamp` di Firestore. I timestamp vengono convertiti da/verso JSON usando il formato:
```json
{
  "_seconds": 1234567890,
  "_nanoseconds": 123456789
}
```

### Collezioni Firestore

- `users` - Utenti principali
  - `users/{userId}/purchases` - Acquisti utente
  - `users/{userId}/remember_list` - Wishlist utente
- `articles` - Articoli (Remember Me e Book Now)
- `authors` - Autori/Traveltaggers
- `advs` - Pubblicità
- `tags` - Tag
- `pages` - Pagine
  - `pages/{pageId}/sections` - Sezioni pagina
- `settings` - Impostazioni globali (documento ID: `1`)
- `logs` - Log applicazione (scrittura diretta, non lettura)

### Query e Filtri

Le query utilizzano `DataFilter` con supporto per:
- `isEqualTo`
- `isNotEqualTo`
- `isLessThan` / `isLessThanOrEqualTo`
- `isGreaterThan` / `isGreaterThanOrEqualTo`
- `arrayContains` / `arrayContainsAny`
- `whereIn` / `whereNotIn`
- `isNull`
