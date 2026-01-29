# Architecture Overview

This document describes the technical architecture of LocalServices, a marketplace platform for local service providers.

## Table of Contents

1. [System Overview](#system-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [Authentication Flow](#authentication-flow)
7. [Data Flow](#data-flow)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├───────────────────┬───────────────────┬─────────────────────────────┤
│    iOS App        │   Android App     │      PWA Website            │
│  (React Native)   │  (React Native)   │   (Next.js + React)         │
│      Expo         │      Expo         │                             │
└─────────┬─────────┴─────────┬─────────┴──────────────┬──────────────┘
          │                   │                        │
          └───────────────────┼────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    API Gateway    │
                    │  (Next.js API     │
                    │   Routes)         │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌──────▼──────┐    ┌──────▼──────┐
    │PostgreSQL │      │  Firebase   │    │ Cloudinary  │
    │ (Supabase)│      │   Auth      │    │  (Images)   │
    └───────────┘      └─────────────┘    └─────────────┘
```

### Technology Decisions

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Mobile | React Native + Expo | Cross-platform, fast development, OTA updates |
| Web | Next.js 14 | SSR, API routes, App Router, great DX |
| API | Next.js API Routes | Unified codebase with frontend |
| Database | PostgreSQL | Reliable, feature-rich, Prisma support |
| Auth | Firebase Auth | Social login, secure, free tier |
| ORM | Prisma | Type-safe, migrations, great DX |
| Validation | Zod | Runtime validation, TypeScript integration |
| State | Zustand + React Query | Lightweight, effective caching |

---

## Monorepo Structure

We use **Turborepo** for monorepo management with **pnpm workspaces**.

```
localservices/
├── apps/
│   ├── web/           # Next.js 14 application
│   └── mobile/        # Expo React Native app
├── packages/
│   ├── shared/        # Shared code (types, validators, i18n)
│   └── database/      # Prisma schema and client
├── turbo.json         # Turborepo configuration
└── pnpm-workspace.yaml
```

### Package Dependencies

```
┌─────────────┐     ┌─────────────┐
│  apps/web   │     │ apps/mobile │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
         ┌───────▼───────┐
         │packages/shared│
         └───────┬───────┘
                 │
       ┌─────────▼─────────┐
       │packages/database  │
       └───────────────────┘
```

### Build Pipeline

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Frontend Architecture

### Web Application (Next.js 14)

```
apps/web/src/
├── app/                    # App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (main)/            # Main app route group
│   │   ├── page.tsx       # Home page
│   │   ├── jobs/          # Job pages
│   │   └── profile/       # Profile pages
│   ├── api/               # API Routes (Backend)
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── offers/
│   │   └── conversations/
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Client providers
├── components/
│   ├── ui/                # Base UI components
│   └── features/          # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── auth-middleware.ts # Auth utilities
│   └── utils.ts          # General utilities
└── stores/               # Zustand stores
```

### Mobile Application (Expo)

```
apps/mobile/
├── app/                   # Expo Router
│   ├── (tabs)/           # Tab navigator
│   │   ├── index.tsx     # Home tab
│   │   ├── browse.tsx    # Browse tab
│   │   ├── messages.tsx  # Messages tab
│   │   └── profile.tsx   # Profile tab
│   ├── (auth)/           # Auth screens
│   ├── job/[id].tsx      # Job detail
│   └── _layout.tsx       # Root layout
├── components/           # React Native components
├── hooks/                # Custom hooks
├── stores/              # Zustand stores
└── app.config.ts        # Expo configuration
```

### State Management

**Zustand** for global state:
```typescript
// stores/auth-store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: () => set({ user: null }),
}));
```

**React Query** for server state:
```typescript
// hooks/use-jobs.ts
export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}
```

---

## Backend Architecture

### API Route Structure

```
app/api/
├── auth/
│   ├── register/route.ts    # POST - Create account
│   └── social/route.ts      # POST - Social login
├── users/
│   ├── me/route.ts          # GET/PATCH - Current user
│   └── [id]/route.ts        # GET - User profile
├── jobs/
│   ├── route.ts             # GET/POST - List/Create jobs
│   └── [id]/
│       ├── route.ts         # GET/PATCH/DELETE - Job CRUD
│       ├── offers/route.ts  # GET/POST - Job offers
│       └── reviews/route.ts # POST - Create review
├── offers/
│   └── [id]/
│       ├── route.ts         # DELETE - Withdraw offer
│       └── accept/route.ts  # PATCH - Accept offer
└── conversations/
    ├── route.ts             # GET - List conversations
    └── [id]/route.ts        # GET/POST - Messages
```

### API Route Pattern

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-middleware';
import { createJobSchema } from '@localservices/shared';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validation
    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // 3. Business Logic
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        posterId: user.id,
        status: 'OPEN',
      },
    });

    // 4. Response
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    // Error handling...
  }
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│     User     │       │     Job      │
├──────────────┤       ├──────────────┤
│ id           │───┐   │ id           │
│ email        │   │   │ title        │
│ firebaseUid  │   ├──▶│ posterId     │
│ name         │   │   │ providerId   │◀──┐
│ avatar       │   │   │ status       │   │
│ phone        │   │   │ category     │   │
│ rating       │   │   │ budget       │   │
└──────────────┘   │   └──────────────┘   │
       │           │          │           │
       │           └──────────┼───────────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    Offer     │       │   Review     │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ jobId        │◀──────│ jobId        │
│ providerId   │       │ authorId     │
│ price        │       │ targetId     │
│ message      │       │ rating       │
│ isAccepted   │       │ comment      │
└──────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐
│ Conversation │       │   Message    │
├──────────────┤       ├──────────────┤
│ id           │◀──────│conversationId│
│ jobId        │       │ senderId     │
│ createdAt    │       │ content      │
└──────────────┘       │ createdAt    │
                       └──────────────┘
```

### Key Relationships

- **User → Job**: One-to-many (poster) and one-to-many (provider)
- **Job → Offer**: One-to-many
- **Job → Review**: One-to-many
- **User → Review**: One-to-many (as author and target)
- **Job → Conversation**: One-to-one
- **Conversation → Message**: One-to-many

---

## Authentication Flow

### Firebase Authentication

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Firebase  │     │  Our API    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Login/Signup   │                   │
       │──────────────────▶│                   │
       │                   │                   │
       │ 2. ID Token       │                   │
       │◀──────────────────│                   │
       │                   │                   │
       │ 3. API Request + Token                │
       │──────────────────────────────────────▶│
       │                   │                   │
       │                   │ 4. Verify Token   │
       │                   │◀──────────────────│
       │                   │                   │
       │                   │ 5. Token Valid    │
       │                   │──────────────────▶│
       │                   │                   │
       │ 6. Response       │                   │
       │◀──────────────────────────────────────│
```

### Token Verification

```typescript
// lib/auth-middleware.ts
export async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });
    return user;
  } catch {
    return null;
  }
}
```

---

## Data Flow

### Creating a Job

```
1. User fills form → Validated with Zod schema
2. Submit → API call with auth token
3. API validates → Creates job in database
4. Response → Update React Query cache
5. UI updates → Show new job
```

### Accepting an Offer

```
1. Poster clicks "Accept" on offer
2. API: Verify poster owns job
3. API: Update offer.isAccepted = true
4. API: Update job.status = IN_PROGRESS
5. API: Set job.providerId
6. API: Create conversation for job
7. Notify provider (future: push notification)
```

---

## Deployment Architecture

### Phase 1 (Current)

```
┌─────────────────────────────────────────┐
│              Vercel                      │
│  ┌───────────────────────────────────┐  │
│  │        Next.js App                │  │
│  │   (Web + API Routes)              │  │
│  └─────────────────┬─────────────────┘  │
└────────────────────┼────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌───────────┐
│Supabase │   │ Firebase  │   │Cloudinary │
│PostgreSQL│  │   Auth    │   │  Images   │
└─────────┘   └───────────┘   └───────────┘
```

### Mobile Deployment

```
┌─────────────────────────────────────────┐
│             EAS Build                    │
│  ┌─────────────────┬─────────────────┐  │
│  │    iOS Build    │  Android Build  │  │
│  └────────┬────────┴────────┬────────┘  │
└───────────┼─────────────────┼───────────┘
            │                 │
            ▼                 ▼
      ┌───────────┐    ┌───────────┐
      │ App Store │    │  Google   │
      │           │    │   Play    │
      └───────────┘    └───────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
1. Push to PR → Trigger CI
2. Install dependencies
3. Generate Prisma client
4. Run lint
5. Run typecheck
6. Run tests
7. Build web app
8. Build mobile (main branch only)
```

```yaml
# .github/workflows/deploy.yml
1. Push to main → Trigger deploy
2. Deploy web to Vercel
3. Run database migrations
4. (Manual) Build and submit mobile apps
```
