# Database Schema Documentation

## Overview

LocalServices uses PostgreSQL as the primary database, managed through Prisma ORM.

- **Phase 1**: Supabase (managed PostgreSQL)
- **Phase 2+**: AWS RDS PostgreSQL

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │     Job      │       │   JobImage   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │◄──────│ posterId     │       │ id           │
│ email        │       │ providerId   │──────►│ jobId        │
│ firebaseUid  │       │ title        │       │ url          │
│ name         │       │ description  │       │ publicId     │
│ avatar       │       │ category     │       │ order        │
│ phone        │       │ budget       │       └──────────────┘
│ bio          │       │ status       │
│ address      │       │ location     │
│ latitude     │       │ latitude     │       ┌──────────────┐
│ longitude    │       │ longitude    │       │    Offer     │
│ role         │       │ scheduledAt  │       ├──────────────┤
│ isVerified   │       └──────────────┘       │ id           │
│ rating       │              │               │ jobId        │──────►Job
│ reviewCount  │              │               │ providerId   │──────►User
└──────────────┘              │               │ price        │
       │                      │               │ message      │
       │                      │               │ isAccepted   │
       │                      ▼               └──────────────┘
       │              ┌──────────────┐
       │              │    Review    │        ┌──────────────┐
       │              ├──────────────┤        │ Conversation │
       │              │ id           │        ├──────────────┤
       └──────────────│ authorId     │        │ id           │
                      │ targetId     │◄───────│ jobId        │
                      │ jobId        │        └──────────────┘
                      │ rating       │               │
                      │ comment      │               │
                      └──────────────┘               ▼
                                              ┌──────────────┐
                                              │   Message    │
                                              ├──────────────┤
                                              │ id           │
                                              │ conversationId
                                              │ senderId     │──────►User
                                              │ content      │
                                              │ imageUrl     │
                                              │ isRead       │
                                              └──────────────┘
```

---

## Tables

### User

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| email | String | Unique, Not Null | User's email |
| firebaseUid | String | Unique, Not Null | Firebase Auth UID |
| name | String | Not Null | Display name |
| avatar | String | Nullable | Profile photo URL |
| phone | String | Nullable | Phone number |
| bio | String | Nullable | User biography |
| address | String | Nullable | Street address |
| latitude | Float | Nullable | Location latitude |
| longitude | Float | Nullable | Location longitude |
| role | Enum | Default: USER | USER, PROVIDER, ADMIN |
| isVerified | Boolean | Default: false | Email verified |
| rating | Float | Default: 0 | Average rating |
| reviewCount | Int | Default: 0 | Total reviews received |
| createdAt | DateTime | Default: now() | Account creation |
| updatedAt | DateTime | Auto-update | Last modification |

**Indexes:**
- `firebaseUid` - Auth lookups
- `(latitude, longitude)` - Geo queries

---

### Job

Stores job postings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| title | String | Not Null | Job title |
| description | String | Not Null | Full description |
| category | Enum | Not Null | BABYSITTING, HOUSE_CLEANING, LOCAL_FOOD, OTHER |
| budget | Decimal(10,2) | Not Null | Offered payment |
| currency | String | Default: USD | Currency code |
| status | Enum | Default: DRAFT | DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED |
| location | String | Not Null | Location description |
| latitude | Float | Not Null | Geo latitude |
| longitude | Float | Not Null | Geo longitude |
| scheduledAt | DateTime | Nullable | When job should occur |
| completedAt | DateTime | Nullable | When job was completed |
| posterId | String | FK → User | Job creator |
| providerId | String | FK → User, Nullable | Assigned provider |
| createdAt | DateTime | Default: now() | Creation time |
| updatedAt | DateTime | Auto-update | Last modification |

**Indexes:**
- `(category, status)` - Filtered listings
- `(latitude, longitude)` - Geo queries
- `posterId` - User's posted jobs
- `providerId` - Provider's assigned jobs

---

### JobImage

Stores images associated with jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| url | String | Not Null | Image URL |
| publicId | String | Not Null | Cloudinary public ID |
| order | Int | Default: 0 | Display order |
| jobId | String | FK → Job | Parent job |
| createdAt | DateTime | Default: now() | Upload time |

**Indexes:**
- `jobId` - Job's images

**Cascade:** Delete when job is deleted

---

### Offer

Stores provider offers on jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| price | Decimal(10,2) | Not Null | Offered price |
| message | String | Not Null | Provider's message |
| isAccepted | Boolean | Default: false | Acceptance status |
| jobId | String | FK → Job | Target job |
| providerId | String | FK → User | Offering provider |
| createdAt | DateTime | Default: now() | Submission time |
| updatedAt | DateTime | Auto-update | Last modification |

**Unique Constraint:** `(jobId, providerId)` - One offer per provider per job

**Indexes:**
- `jobId` - Job's offers
- `providerId` - Provider's offers

**Cascade:** Delete when job is deleted

---

### Review

Stores reviews after job completion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| rating | Int | Not Null, 1-5 | Star rating |
| comment | String | Not Null | Review text |
| jobId | String | FK → Job | Related job |
| authorId | String | FK → User | Review writer |
| targetId | String | FK → User | Reviewed user |
| createdAt | DateTime | Default: now() | Submission time |

**Unique Constraint:** `(jobId, authorId)` - One review per user per job

**Indexes:**
- `targetId` - User's received reviews

---

### Conversation

Stores chat conversations between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| jobId | String | FK → Job, Unique | Related job |
| createdAt | DateTime | Default: now() | Creation time |
| updatedAt | DateTime | Auto-update | Last activity |

---

### ConversationParticipant

Links users to conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| conversationId | String | FK → Conversation | Parent conversation |
| userId | String | FK → User | Participant |
| lastReadAt | DateTime | Default: now() | Last read timestamp |

**Unique Constraint:** `(conversationId, userId)`

**Cascade:** Delete when conversation is deleted

---

### Message

Stores chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| content | String | Not Null | Message text |
| imageUrl | String | Nullable | Attached image |
| isRead | Boolean | Default: false | Read status |
| conversationId | String | FK → Conversation | Parent conversation |
| senderId | String | FK → User | Message author |
| createdAt | DateTime | Default: now() | Send time |

**Indexes:**
- `(conversationId, createdAt)` - Message history

**Cascade:** Delete when conversation is deleted

---

### Promotion (Phase 2)

Stores paid job promotions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, cuid | Unique identifier |
| jobId | String | FK → Job, Unique | Promoted job |
| userId | String | FK → User | Purchaser |
| tier | String | Default: basic | basic, premium, featured |
| startDate | DateTime | Not Null | Promotion start |
| endDate | DateTime | Not Null | Promotion end |
| isActive | Boolean | Default: true | Active status |
| createdAt | DateTime | Default: now() | Purchase time |

**Indexes:**
- `(isActive, endDate)` - Active promotions

---

## Enums

### UserRole
```
USER      - Regular user
PROVIDER  - Service provider
ADMIN     - Platform admin
```

### JobStatus
```
DRAFT       - Not yet published
OPEN        - Accepting offers
IN_PROGRESS - Provider assigned, ongoing
COMPLETED   - Job finished
CANCELLED   - Job cancelled
```

### ServiceCategory
```
BABYSITTING    - Childcare services
HOUSE_CLEANING - Cleaning services
LOCAL_FOOD     - Food/catering
OTHER          - Other services
```

---

## Relationships

### One-to-Many
- User → Jobs (as poster)
- User → Jobs (as provider)
- User → Offers
- User → Reviews (as author)
- User → Reviews (as target)
- User → Messages
- Job → JobImages
- Job → Offers
- Job → Reviews
- Conversation → Messages
- Conversation → ConversationParticipants

### One-to-One
- Job → Conversation
- Job → Promotion

### Many-to-Many
- User ↔ Conversation (via ConversationParticipant)

---

## Common Queries

### Find Jobs Near Location

```sql
SELECT j.*,
  (6371 * acos(cos(radians(:lat)) * cos(radians(j.latitude))
  * cos(radians(j.longitude) - radians(:lng))
  + sin(radians(:lat)) * sin(radians(j.latitude)))) AS distance
FROM jobs j
WHERE j.status = 'OPEN'
  AND j.category = :category
HAVING distance < :radius
ORDER BY distance
LIMIT :limit OFFSET :offset;
```

### Get User Rating

```sql
SELECT AVG(r.rating) as rating, COUNT(*) as count
FROM reviews r
WHERE r.target_id = :userId;
```

### Unread Message Count

```sql
SELECT COUNT(*)
FROM messages m
JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
WHERE cp.user_id = :userId
  AND m.sender_id != :userId
  AND m.created_at > cp.last_read_at;
```

---

## Prisma Schema

See full schema in `packages/database/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models as documented above...
```

---

## Migrations

### Running Migrations

```bash
# Create migration
pnpm db:migrate:dev --name add_feature

# Apply migrations (production)
pnpm db:migrate:deploy

# Reset database (development only)
pnpm db:reset
```

### Migration Naming Convention

```
YYYYMMDDHHMMSS_description
Example: 20240215120000_add_promotions_table
```

---

## Backup Strategy

### Phase 1 (Supabase)
- Automatic daily backups (7 days retention)
- Point-in-time recovery available

### Phase 2 (AWS RDS)
- Automated backups with 30-day retention
- Multi-AZ deployment for high availability
- Read replicas for scaling reads
