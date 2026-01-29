# Extending the App

This guide explains how to add new features to LocalServices. Whether you're adding a new API endpoint, screen, or entire feature module, this document will show you the patterns to follow.

## Table of Contents

1. [Adding a New API Endpoint](#adding-a-new-api-endpoint)
2. [Adding a New Page/Screen](#adding-a-new-pagescreen)
3. [Adding a New Feature Module](#adding-a-new-feature-module)
4. [Adding a New Database Model](#adding-a-new-database-model)
5. [Adding Translations (i18n)](#adding-translations-i18n)
6. [Adding a New Service Category](#adding-a-new-service-category)
7. [Common Extension Patterns](#common-extension-patterns)

---

## Adding a New API Endpoint

### Step 1: Define the Validation Schema

Add Zod schemas to the shared package:

```typescript
// packages/shared/src/validators/index.ts

export const createPromotionSchema = z.object({
  jobId: z.string().cuid(),
  tier: z.enum(['basic', 'premium', 'featured']),
  durationDays: z.number().int().min(1).max(30),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
```

### Step 2: Create the API Route

```typescript
// apps/web/src/app/api/promotions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-middleware';
import { createPromotionSchema } from '@localservices/shared';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const data = createPromotionSchema.parse(body);

    // 3. Business logic (verify ownership)
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job || job.posterId !== user.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 4. Create resource
    const promotion = await prisma.promotion.create({
      data: {
        jobId: data.jobId,
        userId: user.id,
        tier: data.tier,
        startDate: new Date(),
        endDate: new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Create promotion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promotions = await prisma.promotion.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error('List promotions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3: Add React Query Hook

```typescript
// apps/web/src/hooks/use-promotions.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatePromotionInput } from '@localservices/shared';

async function fetchPromotions() {
  const res = await fetch('/api/promotions', {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch promotions');
  return res.json();
}

async function createPromotion(data: CreatePromotionInput) {
  const res = await fetch('/api/promotions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create promotion');
  return res.json();
}

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: fetchPromotions,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
```

---

## Adding a New Page/Screen

### Web (Next.js)

Create a new page in the App Router:

```typescript
// apps/web/src/app/(main)/promotions/page.tsx

import { Metadata } from 'next';
import { PromotionsList } from '@/components/features/promotions-list';

export const metadata: Metadata = {
  title: 'My Promotions | LocalServices',
  description: 'Manage your job promotions',
};

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Promotions</h1>
      <PromotionsList />
    </div>
  );
}
```

Create the component:

```typescript
// apps/web/src/components/features/promotions-list.tsx

'use client';

import { usePromotions } from '@/hooks/use-promotions';
import { PromotionCard } from './promotion-card';
import { Skeleton } from '@/components/ui/skeleton';

export function PromotionsList() {
  const { data: promotions, isLoading, error } = usePromotions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load promotions</div>;
  }

  if (!promotions?.length) {
    return <div className="text-gray-500">No promotions yet</div>;
  }

  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <PromotionCard key={promotion.id} promotion={promotion} />
      ))}
    </div>
  );
}
```

### Mobile (Expo)

Create a new screen:

```typescript
// apps/mobile/app/promotions.tsx

import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePromotions } from '../hooks/use-promotions';
import { PromotionCard } from '../components/promotion-card';
import { COLORS, SPACING } from '@localservices/shared';

export default function PromotionsScreen() {
  const { data: promotions, isLoading, refetch } = usePromotions();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PromotionCard promotion={item} />}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <Text style={styles.empty}>No promotions yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
});
```

Add to navigation (if needed):

```typescript
// apps/mobile/app/(tabs)/_layout.tsx

<Tabs.Screen
  name="promotions"
  options={{
    title: 'Promotions',
    tabBarIcon: ({ color }) => <Star size={24} color={color} />,
  }}
/>
```

---

## Adding a New Feature Module

For complex features, create a complete module structure:

```
packages/shared/src/
├── types/
│   └── promotion.ts        # Type definitions
├── validators/
│   └── promotion.ts        # Zod schemas
└── constants/
    └── promotion.ts        # Feature constants

apps/web/src/
├── app/api/promotions/     # API routes
│   ├── route.ts
│   └── [id]/route.ts
├── app/(main)/promotions/  # Pages
│   ├── page.tsx
│   └── [id]/page.tsx
├── components/features/
│   └── promotions/         # Feature components
│       ├── promotions-list.tsx
│       ├── promotion-card.tsx
│       └── create-promotion-form.tsx
├── hooks/
│   └── use-promotions.ts   # React Query hooks
└── stores/
    └── promotion-store.ts  # Zustand store (if needed)
```

### Feature Checklist

- [ ] Types defined in `packages/shared/src/types/`
- [ ] Zod schemas in `packages/shared/src/validators/`
- [ ] Database model (if needed) in `packages/database/prisma/schema.prisma`
- [ ] API routes in `apps/web/src/app/api/`
- [ ] React Query hooks in `apps/web/src/hooks/`
- [ ] Web pages in `apps/web/src/app/(main)/`
- [ ] Mobile screens in `apps/mobile/app/`
- [ ] Translations in `packages/shared/src/i18n/locales/`
- [ ] Tests for API and components

---

## Adding a New Database Model

### Step 1: Update Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

model Notification {
  id        String   @id @default(cuid())
  type      String   // job_offer, offer_accepted, new_message, etc.
  title     String
  body      String
  isRead    Boolean  @default(false)
  data      Json?    // Additional data
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
}
```

Don't forget to add the relation to User:

```prisma
model User {
  // ... existing fields
  notifications Notification[]
}
```

### Step 2: Create Migration

```bash
pnpm db:migrate:dev --name add_notifications
```

### Step 3: Update Seed Data (Optional)

```typescript
// packages/database/prisma/seed.ts

// Add notification seeding
await prisma.notification.createMany({
  data: [
    {
      userId: user1.id,
      type: 'job_offer',
      title: 'New offer received',
      body: 'You have a new offer on your job posting',
      isRead: false,
    },
  ],
});
```

### Step 4: Add Types to Shared Package

```typescript
// packages/shared/src/types/notification.ts

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  userId: string;
}

export type NotificationType =
  | 'job_offer'
  | 'offer_accepted'
  | 'new_message'
  | 'review_received';
```

---

## Adding Translations (i18n)

### Step 1: Add Keys to English

```typescript
// packages/shared/src/i18n/locales/en.ts

export const en = {
  // ... existing translations
  promotions: {
    title: 'Promotions',
    create: 'Create Promotion',
    tiers: {
      basic: 'Basic',
      premium: 'Premium',
      featured: 'Featured',
    },
    duration: {
      label: 'Duration',
      days: '{{count}} days',
    },
    success: 'Promotion created successfully',
    error: 'Failed to create promotion',
  },
};
```

### Step 2: Add Keys to Romanian

```typescript
// packages/shared/src/i18n/locales/ro.ts

export const ro = {
  // ... existing translations
  promotions: {
    title: 'Promotii',
    create: 'Creeaza Promotie',
    tiers: {
      basic: 'De baza',
      premium: 'Premium',
      featured: 'Recomandat',
    },
    duration: {
      label: 'Durata',
      days: '{{count}} zile',
    },
    success: 'Promotia a fost creata cu succes',
    error: 'Eroare la crearea promotiei',
  },
};
```

### Step 3: Use Translations

```typescript
// Web (Next.js)
import { useTranslations } from '@/hooks/use-translations';

function PromotionsPage() {
  const t = useTranslations();

  return (
    <h1>{t.promotions.title}</h1>
  );
}

// Mobile (React Native)
import { useTranslations } from '../hooks/use-translations';

function PromotionsScreen() {
  const t = useTranslations();

  return (
    <Text>{t.promotions.title}</Text>
  );
}
```

---

## Adding a New Service Category

### Step 1: Update Constants

```typescript
// packages/shared/src/constants/index.ts

export const SERVICE_CATEGORIES = {
  BABYSITTING: {
    id: 'BABYSITTING',
    color: '#FF6B6B',
    icon: 'baby',
  },
  HOUSE_CLEANING: {
    id: 'HOUSE_CLEANING',
    color: '#4ECDC4',
    icon: 'home',
  },
  LOCAL_FOOD: {
    id: 'LOCAL_FOOD',
    color: '#FFE66D',
    icon: 'utensils',
  },
  // Add new category
  PET_CARE: {
    id: 'PET_CARE',
    color: '#95E1D3',
    icon: 'paw',
  },
  OTHER: {
    id: 'OTHER',
    color: '#95A5A6',
    icon: 'more-horizontal',
  },
} as const;
```

### Step 2: Update Database Enum

```prisma
// packages/database/prisma/schema.prisma

enum ServiceCategory {
  BABYSITTING
  HOUSE_CLEANING
  LOCAL_FOOD
  PET_CARE    // Add new category
  OTHER
}
```

### Step 3: Create Migration

```bash
pnpm db:migrate:dev --name add_pet_care_category
```

### Step 4: Add Translations

```typescript
// packages/shared/src/i18n/locales/en.ts
categories: {
  BABYSITTING: 'Babysitting',
  HOUSE_CLEANING: 'House Cleaning',
  LOCAL_FOOD: 'Local Food',
  PET_CARE: 'Pet Care',  // Add
  OTHER: 'Other',
}

// packages/shared/src/i18n/locales/ro.ts
categories: {
  BABYSITTING: 'Babysitting',
  HOUSE_CLEANING: 'Curatenie',
  LOCAL_FOOD: 'Mancare Locala',
  PET_CARE: 'Ingrijire Animale',  // Add
  OTHER: 'Altele',
}
```

---

## Common Extension Patterns

### Protected Route Pattern

```typescript
// apps/web/src/app/(main)/protected-page/page.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/protected-page');
  }

  return <div>Protected content for {user.name}</div>;
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateJob,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['jobs', jobId] });
    const previous = queryClient.getQueryData(['jobs', jobId]);
    queryClient.setQueryData(['jobs', jobId], (old) => ({
      ...old,
      ...newData,
    }));
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['jobs', jobId], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
  },
});
```

### Error Boundary Pattern

```typescript
// apps/web/src/components/error-boundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Loading State Pattern

```typescript
// Consistent loading UI
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner />
    </div>
  );
}

// Usage with Suspense
<Suspense fallback={<LoadingState />}>
  <AsyncComponent />
</Suspense>
```
