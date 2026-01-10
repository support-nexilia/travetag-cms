# TravelTag CMS Architecture

## Technology Stack

- **Astro** - SSR framework with island architecture
- **React** - Interactive UI components with client-side hydration
- **Prisma** - Type-safe ORM (PostgreSQL for production, SQLite for development)
- **GraphQL** - API layer for external clients consuming CMS content
- **Zod** - Schema validation and type inference
- **Tailwind CSS + shadcn/ui** - Styling and component library

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

## Entities

### User
- `id` (UUID) - Unique identifier
- `username` (string, unique) - User's username
- `email` (string, unique) - User's email
- `role` (enum) - Role: `admin`, `editor`
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Relationship: One-to-Many with Post

### Category
- `id` (UUID) - Unique identifier
- `name` (string) - Category name
- `slug` (string, unique) - Unique slug auto-generated from name
- `description` (string, optional) - Category description
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Relationship: Many-to-Many with Post

### Tag
- `id` (UUID) - Unique identifier
- `name` (string) - Tag name
- `slug` (string, unique) - Unique slug auto-generated from name
- `description` (string, optional) - Tag description
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- Relationship: Many-to-Many with Post

### Adv
- `id` (UUID) - Unique identifier
- `title` (string) - Advertising title
- `subtitle` (string, optional) - Subtitle
- `link` (string, optional) - Destination URL
- `date` (datetime, editable) - Publication date (can be future)
- `status` (enum) - Status: `published`, `deleted`, `planned`, `draft`
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- `user_id` (UUID) - Advertisement author
- Relationship: Many-to-One with User

**Adv Notes**:
- Future date → `status = 'planned'`
- Cron system automatically publishes when scheduled date is reached
- Only admins can modify `user_id` (assign to other users)

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

### Post
- `id` (UUID) - Unique identifier
- `title` (string) - Post title
- `slug` (string, unique) - Unique slug auto-generated from title
- `description` (string, optional) - Short description
- `content` (string, optional) - Full post content
- `date` (datetime, editable) - Publication date (can be future)
- `status` (enum) - Status: `published`, `deleted`, `revision`, `draft`, `planned`
- `parent_id` (UUID, nullable) - Main post ID (NULL for main posts, set for revisions)
- `created_at` (datetime) - Creation date
- `updated_at` (datetime) - Last update date
- `user_id` (UUID) - Post author
- Relationship: Many-to-One with User
- Relationship: Self-relation One-to-Many (one post can have many revisions)
- Relationship: Many-to-Many with Category
- Relationship: Many-to-Many with Tag

**Revision Management**:
- Main post: `status = 'published'/'draft'/'planned'`, `parent_id = NULL`
- Revisions: `status = 'revision'`, `parent_id` points to main post
- Each modification creates a new revision maintaining complete history
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
