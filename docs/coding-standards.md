# Coding Standards

This document defines the coding standards and best practices for the LocalServices project. Following these guidelines ensures consistency and maintainability across the codebase.

## Table of Contents

1. [TypeScript Guidelines](#typescript-guidelines)
2. [React/React Native Guidelines](#reactreact-native-guidelines)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [Code Style](#code-style)
6. [API Design](#api-design)
7. [Database Queries](#database-queries)
8. [Testing Standards](#testing-standards)
9. [Security Practices](#security-practices)
10. [Performance Guidelines](#performance-guidelines)

---

## TypeScript Guidelines

### Strict Mode

TypeScript strict mode is enabled. Never use `// @ts-ignore` or `any`.

```typescript
// BAD
const data: any = response.data;
// @ts-ignore
someFunction(invalidArg);

// GOOD
const data: ApiResponse = response.data;
// Type guard for unknown data
function isApiResponse(data: unknown): data is ApiResponse {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### Type vs Interface

Use `interface` for object shapes that might be extended. Use `type` for unions, intersections, and primitives.

```typescript
// Interface for extendable object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Type for unions and computed types
type JobStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
type JobWithUser = Job & { user: User };
type OptionalJob = Partial<Job>;
```

### Prefer Explicit Return Types

Always add return types to exported functions:

```typescript
// BAD
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// GOOD
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Use Zod for Runtime Validation

All external data (API inputs, form data) must be validated with Zod:

```typescript
import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  description: z.string().min(20).max(2000).trim(),
  budget: z.number().positive().max(100000),
  category: z.enum(['BABYSITTING', 'HOUSE_CLEANING', 'LOCAL_FOOD', 'OTHER']),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
```

---

## React/React Native Guidelines

### Component Structure

Follow this structure within components:

```typescript
import { useState, useEffect, type FC } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
  className?: string;
}

export const JobCard: FC<JobCardProps> = ({ job, onSelect, className }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  // 2. Derived/computed values
  const isOwner = user?.id === job.posterId;
  const formattedBudget = `$${job.budget.toFixed(2)}`;

  // 3. Effects
  useEffect(() => {
    // Side effects here
  }, [dependency]);

  // 4. Handlers
  const handleSelect = () => {
    onSelect?.(job);
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  // 5. Early returns for loading/error states
  if (!job) {
    return null;
  }

  // 6. Render
  return (
    <div className={cn('rounded-lg p-4 bg-white', className)}>
      <h3 className="font-semibold">{job.title}</h3>
      <p className="text-gray-600">{formattedBudget}</p>
      {isExpanded && <p>{job.description}</p>}
      <Button onClick={handleSelect}>Select</Button>
    </div>
  );
};
```

### Hooks Rules

- Only call hooks at the top level
- Only call hooks from React functions
- Custom hooks must start with `use`

```typescript
// BAD - conditional hook
if (isLoggedIn) {
  const user = useUser(); // Never do this
}

// GOOD
const user = useUser();
if (!isLoggedIn) {
  return <LoginPrompt />;
}
```

### Avoid Inline Functions in JSX (When Performance Matters)

```typescript
// BAD - creates new function every render
<Button onClick={() => handleDelete(item.id)}>Delete</Button>

// GOOD - for lists with many items
const handleDelete = useCallback((id: string) => {
  deleteItem(id);
}, [deleteItem]);

// Or use data attributes
<Button data-id={item.id} onClick={handleDelete}>Delete</Button>
```

### State Management Hierarchy

1. **Local state** (useState) - Component-specific state
2. **React Query** - Server state (fetched data)
3. **Zustand** - Global client state (auth, preferences)

```typescript
// Server state with React Query
const { data: jobs, isLoading } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters),
});

// Global state with Zustand
const { user, setUser } = useAuthStore();

// Local state
const [isModalOpen, setIsModalOpen] = useState(false);
```

---

## File Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router / Expo Router
│   ├── (auth)/            # Route groups
│   ├── (main)/
│   └── api/
├── components/
│   ├── ui/                # Base UI components (Button, Input, etc.)
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── stores/               # Zustand stores
├── services/             # API client functions
└── types/                # TypeScript types (if not using shared)
```

### File Naming

| Type       | Convention     | Example          |
| ---------- | -------------- | ---------------- |
| Components | kebab-case.tsx | `job-card.tsx`   |
| Hooks      | use-\*.ts      | `use-jobs.ts`    |
| Utilities  | kebab-case.ts  | `format-date.ts` |
| Types      | kebab-case.ts  | `job-types.ts`   |
| Constants  | kebab-case.ts  | `api-routes.ts`  |
| Stores     | \*-store.ts    | `auth-store.ts`  |

### Import Order

```typescript
// 1. React/Next imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal packages
import { createJobSchema } from '@localservices/shared';
import { prisma } from '@localservices/database';

// 4. Local imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 5. Relative imports
import { JobCard } from './job-card';

// 6. Types (last)
import type { Job } from '@/types';
```

---

## Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const userName = 'John';
const isActive = true;
const jobCount = 42;

function getUserById(id: string): User {}
async function fetchJobs(): Promise<Job[]> {}
const handleSubmit = () => {};
```

### Constants

```typescript
// SCREAMING_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

### Components and Types

```typescript
// PascalCase for components, types, interfaces, enums
function UserProfile() {}
interface UserData {}
type JobStatus = 'open' | 'closed';
enum PaymentMethod {
  CreditCard,
  PayPal,
}
```

### Boolean Variables

Prefix with `is`, `has`, `can`, `should`:

```typescript
const isLoading = true;
const hasPermission = false;
const canEdit = user.role === 'admin';
const shouldRefetch = staleTime > 0;
```

### Event Handlers

Prefix with `handle` or `on`:

```typescript
// In component
const handleSubmit = () => {};
const handleInputChange = (e: ChangeEvent) => {};

// As props
interface Props {
  onSubmit: () => void;
  onChange: (value: string) => void;
}
```

---

## Code Style

### Formatting

Prettier handles formatting. Key settings:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Avoid Magic Numbers/Strings

```typescript
// BAD
if (user.role === 1) {
}
const delay = 5000;

// GOOD
const ADMIN_ROLE = 1;
const NOTIFICATION_DELAY_MS = 5000;

if (user.role === ADMIN_ROLE) {
}
const delay = NOTIFICATION_DELAY_MS;
```

### Early Returns

Reduce nesting with early returns:

```typescript
// BAD
function processJob(job: Job | null) {
  if (job) {
    if (job.status === 'OPEN') {
      if (job.budget > 0) {
        // actual logic
      }
    }
  }
}

// GOOD
function processJob(job: Job | null) {
  if (!job) return;
  if (job.status !== 'OPEN') return;
  if (job.budget <= 0) return;

  // actual logic
}
```

### Destructuring

Use destructuring for cleaner code:

```typescript
// BAD
const name = props.user.name;
const email = props.user.email;

// GOOD
const { user } = props;
const { name, email } = user;

// Or inline
function UserCard({ user: { name, email } }: Props) {}
```

---

## API Design

### RESTful Endpoints

```
GET    /api/jobs           # List (with pagination/filters)
POST   /api/jobs           # Create
GET    /api/jobs/:id       # Read one
PATCH  /api/jobs/:id       # Update
DELETE /api/jobs/:id       # Delete

# Nested resources
GET    /api/jobs/:id/offers
POST   /api/jobs/:id/offers

# Actions (verbs when needed)
POST   /api/jobs/:id/publish
POST   /api/offers/:id/accept
```

### Response Format

```typescript
// Success responses
{ data: Job }                    // Single resource
{ data: Job[], total: 100 }      // List with pagination

// Error responses
{
  error: string,                 // Human-readable message
  code?: string,                 // Machine-readable code
  details?: ValidationError[]    // For validation errors
}
```

### Status Codes

| Code | Usage                    |
| ---- | ------------------------ |
| 200  | Success (GET, PATCH)     |
| 201  | Created (POST)           |
| 204  | No Content (DELETE)      |
| 400  | Bad Request (validation) |
| 401  | Unauthorized             |
| 403  | Forbidden                |
| 404  | Not Found                |
| 500  | Server Error             |

---

## Database Queries

### Use Select for Performance

```typescript
// BAD - fetches all columns
const users = await prisma.user.findMany();

// GOOD - fetch only needed columns
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Use Include Sparingly

```typescript
// BAD - deep nested includes
const job = await prisma.job.findUnique({
  where: { id },
  include: {
    poster: {
      include: {
        reviews: {
          include: {
            author: true,
          },
        },
      },
    },
  },
});

// GOOD - separate queries or limited includes
const job = await prisma.job.findUnique({
  where: { id },
  include: {
    poster: {
      select: { id: true, name: true, avatar: true },
    },
  },
});
```

### Transactions for Multiple Operations

```typescript
await prisma.$transaction(async (tx) => {
  const offer = await tx.offer.update({
    where: { id: offerId },
    data: { isAccepted: true },
  });

  await tx.job.update({
    where: { id: offer.jobId },
    data: {
      status: 'IN_PROGRESS',
      providerId: offer.providerId,
    },
  });

  await tx.conversation.create({
    data: { jobId: offer.jobId },
  });
});
```

---

## Testing Standards

### Test File Location

```
src/
├── components/
│   └── job-card.tsx
│   └── __tests__/
│       └── job-card.test.tsx
├── hooks/
│   └── use-jobs.ts
│   └── __tests__/
│       └── use-jobs.test.ts
```

### Test Naming

```typescript
describe('JobCard', () => {
  it('should render job title', () => {});
  it('should call onSelect when clicked', () => {});
  it('should show loading state when isLoading is true', () => {});
});
```

### Test Structure (AAA Pattern)

```typescript
it('should create a job', async () => {
  // Arrange
  const input = { title: 'Test Job', budget: 100 };
  const mockCreate = vi.fn().mockResolvedValue({ id: '1', ...input });

  // Act
  const result = await createJob(input);

  // Assert
  expect(result.id).toBe('1');
  expect(mockCreate).toHaveBeenCalledWith(input);
});
```

---

## Security Practices

### Input Validation

Always validate at API boundaries:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate with Zod
  const result = createJobSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.errors },
      { status: 400 }
    );
  }

  // Use validated data
  const validatedData = result.data;
}
```

### Authorization Checks

Always verify ownership/permissions:

```typescript
const job = await prisma.job.findUnique({ where: { id } });

// Check existence
if (!job) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// Check ownership
if (job.posterId !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Sensitive Data

Never log or return sensitive data:

```typescript
// BAD
console.log('User password:', user.password);
return NextResponse.json(user); // May include sensitive fields

// GOOD
console.log('User login:', user.email);
return NextResponse.json({
  id: user.id,
  name: user.name,
  email: user.email,
});
```

---

## Performance Guidelines

### React Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
});
```

### Image Optimization

```typescript
// Web - use next/image
import Image from 'next/image';
<Image src={url} alt={alt} width={400} height={300} />

// Mobile - use expo-image with caching
import { Image } from 'expo-image';
<Image source={{ uri: url }} style={styles.image} contentFit="cover" />
```

### Lazy Loading

```typescript
// Web - dynamic imports
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});

// Mobile - lazy loading in navigation
const HeavyScreen = React.lazy(() => import('./HeavyScreen'));
```

### Pagination

Always paginate large lists:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['jobs'],
  queryFn: ({ pageParam = 0 }) => fetchJobs({ offset: pageParam }),
  getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
});
```
