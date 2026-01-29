# LocalServices - Claude Code Guide

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

| Purpose | Web | Mobile |
|---------|-----|--------|
| Pages/Screens | `apps/web/src/app/` | `apps/mobile/app/` |
| Components | `apps/web/src/components/` | `apps/mobile/components/` |
| API Routes | `apps/web/src/app/api/` | N/A (uses web API) |
| Hooks | `apps/web/src/hooks/` | `apps/mobile/hooks/` |
| Stores | `apps/web/src/stores/` | `apps/mobile/stores/` |

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
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_*` - Firebase project credentials
- `NEXT_PUBLIC_*` - Client-side Firebase config
