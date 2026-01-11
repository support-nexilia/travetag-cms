# TravelTag CMS Architecture

## Technology Stack

- **Astro** - SSR framework with island architecture
- **React** - Interactive UI components with client-side hydration
- **MongoDB** - NoSQL document database with native driver
- **GraphQL** - API layer for external clients consuming CMS content
- **Zod** - Schema validation and type inference
- **Tailwind CSS + shadcn/ui** - Styling and component library

## Database

### MongoDB
- **Native MongoDB Node.js Driver** - Direct database access without ORM overhead
- **Document-oriented** - Perfect for nested structures (prices, itinerary_items, etc.)
- **Flexible schema** - Easy evolution without migrations
- **Collections**: `authors`, `articles`, `tags`, `categories`, `pages`, `advs`, `app_settings`

### Data Layer Pattern
```typescript
// src/data/article.ts
import { getDb } from '@/lib/mongodb';

export async function getAllArticles() {
  const db = await getDb();
  return db.collection('articles').find({}).toArray();
}

export async function getArticleById(id: string) {
  const db = await getDb();
  return db.collection('articles').findOne({ _id: new ObjectId(id) });
}
```

## API

### `pages/api/graphql`
GraphQL endpoint for external clients consuming CMS content.

## Folder Structure

### `src/entities`
Entity definitions using Zod for validation and type-safety.

### `src/data`
Data abstraction layer for retrieving and modifying data. Contains all functions for API calls and entity management.

### `src/services`
Reusable application services.

### `src/pages`
Application pages with Astro.js routing.

**Special pages:**
- `pages/demo` - Component library (dev mode only)

### `src/components`
Components organized by type:
- `layouts/` - Generic layout components
- `form/` - Form components
  - Autocomplete for Category/Tag with dynamic suggestions
- Other folders for thematic components

### `src/utils`
Reusable utilities and logic.

## Entities (MongoDB Collections)

### Author
- `_id` (ObjectId) - Unique identifier
- `name` (string) - Full name
- `nickname` (string, optional) - Nickname
- `email` (string, unique) - Email address
- `image` (SizedImage/String) - Profile image
- `background_image` (SizedImage/String) - Background image
- `bio` (string, optional) - Biography
- `is_admin` (boolean) - Admin flag
- `is_tour_leader` (boolean, optional) - Tour leader flag
- `social` (array) - Social network links [{ type, url }]
- `languages` (array) - Spoken languages ["it", "en", "es"]
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Index: `email` (unique)

### Article
- `_id` (ObjectId) - Unique identifier
- `author_id` (ObjectId) - Reference to Author
- `title` (string) - Article title
- `subtitle` (string, optional) - Subtitle
- `description` (string) - Description
- `image` (SizedImage/String) - Main image
- `video_full` (VideoFull/String) - Video object or URL
- `slug` (string, unique) - URL-friendly slug
- `type` (string) - "REMEMBER" or "BOOK_NOW"
- `tag_ids` (array[ObjectId]) - Tag references
- `category_id` (number) - Category reference
- `published` (boolean) - Publication status
- `published_date` (datetime) - Publication date
- **REMEMBER fields**: `date`, `description_HTML`, `indicative_price`
- **BOOKING fields**: trip dates, prices (flat structure), travelers config, sections, itinerary_items (embedded array), optional_products (embedded array)
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Indexes: `slug` (unique), `author_id`, `type`, `published`, `published_date`, `tag_ids` (multikey)

### Tag
- `_id` (ObjectId) - Unique identifier
- `name` (string) - Tag name
- `slug` (string, unique) - Unique slug auto-generated from name
- `description` (string, optional) - Tag description
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Index: `slug` (unique)

### Category
- `id` (number) - Integer identifier (compatibility with Firestore)
- `name` (string) - Category name
- `slug` (string, unique) - Unique slug auto-generated from name
- `description` (string, optional) - Category description
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Index: `slug` (unique)

### Adv
- `_id` (ObjectId) - Unique identifier
- `title` (string) - Advertising title
- `subtitle` (string, optional) - Subtitle
- `link` (string, optional) - Destination URL
- `date` (datetime, editable) - Publication date (can be future)
- `status` (enum) - Status: `published`, `deleted`, `planned`, `draft`
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- `author_id` (ObjectId) - Advertisement author
- Index: `status`, `date`

**Adv Notes**:
- Future date → `status = 'planned'`
- Cron system automatically publishes when scheduled date is reached
- Only admins can modify `author_id` (assign to other users)

## Cron System

### Functionality
The cron system manages automatic publication of scheduled Posts and Advs.

### Components

**Service (`src/services/cron.ts`)**:
- `publishScheduledContent()` - Main function that finds and publishes content with status=PLANNED and date <= now
- `triggerPublishNow()` - Manual trigger for testing

**API Endpoint (`src/pages/api/cron/trigger.ts`)**:
- POST `/api/cron/trigger` - Manual trigger (admin only)
- Returns number of posts and advs published

**UI Dashboard (`src/pages/cron.astro`)**:
- Displays all scheduled posts and advs
- Button to manually execute publication
- Highlights content with past dates (ready to publish)

### Behavior
1. When Posts/Advs are created/modified with `status=PLANNED`:
   - The publication plan is logged
   - Content remains waiting until scheduled date

2. The cron service (to be executed periodically, e.g., every minute):
   - Searches for Posts/Advs with `status=PLANNED` and `date <= NOW()`
   - Changes status to `PUBLISHED`
   - Logs successful publication

3. Admin dashboard:
   - Shows all scheduled content
   - Allows manual execution
   - Highlights content ready for publication

**Note**: In production, configure a system cron job or scheduled service (e.g., vercel-cron) to periodically call `/api/cron/trigger`.

## Data Model Reference

See detailed model documentation:
- **Full Model**: `docs/new-model-description.md` - Complete MongoDB schema with all fields
- **Visual Diagram**: `docs/new-model-diagram.mermaid` - ER diagram of collections and relationships
- **Original Firestore Model**: `docs/migration_models.md` - Reference from Flutter app
- Query revisions: `WHERE parent_id = X AND status = 'revision' ORDER BY created_at DESC`

**Post Notes**:
- Future date → `status = 'planned'`
- Cron system automatically publishes when scheduled date is reached
- Slug auto-generated from title if not specified
- Only admins can modify `user_id` (assign to other users)

**Note**: UUIDs are recommended for IDs for better scalability, security, and data distribution.

## Authentication

**Phase 1 (MVP)**: Hardcoded session with default user:
- Email: `davide.cocco@mosai.co`
- Username: `coccus`
- Role: `admin`

**Phase 2**: OIDC integration for complete authentication.

## Permissions

- **Admin**: Can modify `user_id` in Posts and Advs (assign content to other users)
- **Editor**: Can only manage their own content
