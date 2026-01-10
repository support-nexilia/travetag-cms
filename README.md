# TravelTag CMS

A modern headless Content Management System built with Astro, React, Prisma, and GraphQL. Designed for managing travel content with advanced features like scheduled publishing, content revisions, and multi-user permissions.

## ✨ Features

- **📝 Content Management**: Posts and advertising with rich text support
- **🏷️ Taxonomy System**: Categories and tags with automatic slug generation
- **⏰ Scheduled Publishing**: Cron-based auto-publishing for planned content
- **📚 Revision History**: Complete version control for posts
- **👥 Multi-user Support**: Admin and editor roles with granular permissions
- **🔌 GraphQL API**: Public API for external content consumption
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **🔒 Type-safe**: Full TypeScript support with Zod validation

## 🚀 Tech Stack

- **[Astro](https://astro.build)** - SSR framework with island architecture
- **[React](https://react.dev)** - Interactive UI components
- **[Prisma](https://prisma.io)** - Type-safe ORM (PostgreSQL/SQLite)
- **[GraphQL](https://graphql.org)** - API layer with Apollo Server
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com)** - Re-usable component library
- **[Zod](https://zod.dev)** - Schema validation and type inference

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd traveltag-cms

# Install dependencies
pnpm install

# Setup database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed with demo data (optional)

# Start development server
pnpm dev
```

## 🧞 Commands

| Command | Action |
|---------|--------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |

## 📁 Project Structure

```
/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── form/          # Form components (autocomplete, inputs)
│   │   ├── layouts/       # Layout components (menu, sidebar)
│   │   └── ui/            # UI components (buttons, modals, toast)
│   ├── data/              # Data layer (CRUD operations)
│   ├── entities/          # Zod schemas and type definitions
│   ├── pages/
│   │   ├── api/           # API endpoints (GraphQL, cron)
│   │   ├── categories/    # Category CRUD pages
│   │   ├── tags/          # Tag CRUD pages
│   │   ├── posts/         # Post CRUD pages
│   │   ├── advs/          # Advertising CRUD pages
│   │   └── cron.astro     # Scheduled content dashboard
│   ├── services/          # Business logic (cron, utilities)
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions (auth, slug generation)
└── docs/
    └── architecture.md    # Detailed architecture documentation
```

## 🔑 Authentication

**Current (MVP)**: Hardcoded session with default admin user
- Email: `davide.cocco@mosai.co`
- Username: `coccus`
- Role: `admin`

**Future**: OIDC integration for production authentication

## 🎯 Key Features Explained

### Scheduled Publishing
Content with future publication dates is automatically set to `PLANNED` status. The cron system checks periodically and publishes content when the scheduled date is reached.

- **Manual Trigger**: `/cron` dashboard with "Publish Now" button
- **Auto Execution**: Configure external cron job to call `/api/cron/trigger`

### Content Revisions
Every post modification creates a new revision while preserving the original. Revisions are linked via `parent_id` and can be restored or compared.

### Slug Generation
Categories, tags, and posts automatically generate URL-friendly slugs from their titles. Duplicate slugs are handled with numeric suffixes.

### Permissions
- **Admin**: Full access, can assign content to other users
- **Editor**: Can only manage their own content

## 🔌 GraphQL API

Access the GraphQL playground at `/api/graphql` during development.

**Example Query**:
```graphql
query {
  posts(status: "published") {
    id
    title
    slug
    content
    date
    categories {
      name
      slug
    }
    tags {
      name
    }
  }
}
```

## 📖 Documentation

For detailed architecture, data models, and API documentation, see [docs/architecture.md](./docs/architecture.md).

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- TypeScript types are properly defined
- Prisma schema changes include migrations
- UI components match existing design system

## 📄 License

[Add your license here]
