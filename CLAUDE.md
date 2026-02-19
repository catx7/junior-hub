# JuniorHub - Claude Code Guide

## Quick Reference

### Essential Commands

```bash
# Development
pnpm dev              # Start all apps (web + mobile)
pnpm dev:web          # Start Next.js web app only
pnpm dev:mobile       # Start Expo mobile app only

# Building
pnpm build            # Build all packages
pnpm build:web        # Build web app only

# Testing & Quality
pnpm test             # Run all tests
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript validation

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations (production)
pnpm db:migrate:dev   # Run migrations (development)
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed with test data
```

### Local Development Setup

```bash
docker-compose up -d   # Start PostgreSQL + Redis
pnpm install           # Install dependencies
pnpm db:generate       # Generate Prisma client
pnpm db:migrate:dev    # Apply migrations
pnpm dev               # Start development
```

## Architecture Overview

**Monorepo** using Turborepo with pnpm workspaces:

- `apps/web` - Next.js 14 (PWA + API routes)
- `apps/mobile` - React Native Expo (iOS + Android)
- `packages/shared` - Shared types, validators, i18n, constants
- `packages/database` - Prisma schema and client

**Tech Stack:**

- TypeScript strict mode throughout
- Prisma ORM with PostgreSQL
- Firebase Auth (Google, Facebook, Email)
- Zustand + React Query for state
- Tailwind CSS (web) / StyleSheet (mobile)
- Zod for runtime validation

## Key Patterns

### API Routes (Next.js)

Located in `apps/web/src/app/api/`. Follow this pattern:

1. Authenticate with `verifyAuthToken()` from `lib/auth-middleware.ts`
2. Validate input with Zod schemas from `@localservices/shared`
3. Use Prisma for database operations
4. Return JSON responses with appropriate status codes

### Shared Code

Import from `@localservices/shared`:

- Types: `User`, `Job`, `Offer`, `Review`, etc.
- Validators: `createJobSchema`, `createOfferSchema`, etc.
- Constants: `COLORS`, `SERVICE_CATEGORIES`, `SPACING`
- i18n: `translations.en`, `translations.ro`

### Component Structure

- Web: `apps/web/src/components/ui/` for base components
- Mobile: `apps/mobile/components/` with React Native primitives
- Both use the shared color palette and spacing constants

### Database Schema

Key models in `packages/database/prisma/schema.prisma`:

- `User` - Profiles with Firebase UID linking
- `Job` - Service requests with status workflow
- `Offer` - Provider bids on jobs
- `Review` - Ratings after job completion
- `Conversation`/`Message` - In-app chat

## File Locations

| Purpose       | Web                        | Mobile                    |
| ------------- | -------------------------- | ------------------------- |
| Pages/Screens | `apps/web/src/app/`        | `apps/mobile/app/`        |
| Components    | `apps/web/src/components/` | `apps/mobile/components/` |
| API Routes    | `apps/web/src/app/api/`    | N/A (uses web API)        |
| Hooks         | `apps/web/src/hooks/`      | `apps/mobile/hooks/`      |
| Stores        | `apps/web/src/stores/`     | `apps/mobile/stores/`     |

## Important Conventions

- **File naming**: kebab-case (`job-card.tsx`)
- **Components**: PascalCase exports (`export function JobCard`)
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`)
- **i18n**: All user-facing strings via translation keys
- **Validation**: Zod schemas for all API inputs
- **Auth**: Firebase tokens verified on every protected route

## CI/CD

- `.github/workflows/ci.yml` - Lint, typecheck, test, build on PRs
- `.github/workflows/deploy.yml` - Deploy to Vercel (web) and EAS (mobile)
- Vercel auto-deploys from `main` branch
- Mobile builds via EAS on `workflow_dispatch`

## Environment Variables

Required in `.env.local` (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."

# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY="..." # For push notifications

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID="..."
FIREBASE_ADMIN_PRIVATE_KEY="..."
FIREBASE_ADMIN_CLIENT_EMAIL="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## New Features

### 🎉 Kids Events

- **Location**: `/kids-events`
- **Purpose**: Discover community events for children
- **Categories**: Art, Sports, Education, Performing Arts

### 👕 Kids Clothes Marketplace

- **Location**: `/kids-clothes`
- **Purpose**: Buy, sell, donate kids clothes
- **Modes**: Sell (set price) or Donate (free)

### 🛡️ Admin Dashboard

- **Location**: `/admin` (requires ADMIN role)
- **Features**:
  - User management (edit roles, delete users)
  - Job management (change status, moderate)
  - Review management
  - Push notifications to users
  - Provider verification system

## Admin Setup

**Make yourself admin:**

```bash
# Using Prisma Studio
pnpm db:studio
# Find your user → Change role to 'ADMIN'

# Or using SQL
psql $DATABASE_URL
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

**Access admin dashboard:** Navigate to `/admin`

See [Admin Setup Guide](./docs/admin-setup.md) for details.
