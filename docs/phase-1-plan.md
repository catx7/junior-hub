# Phase 1: MVP Launch

**Duration**: 8-12 weeks
**Goal**: Launch a functional marketplace with core features using free-tier services
**Monetization**: Google AdMob (mobile) + Google AdSense (web)

---

## Objectives

1. Build and deploy a working marketplace MVP
2. Validate product-market fit with real users
3. Minimize costs using free-tier infrastructure
4. Establish foundation for Phase 2 monetization

---

## Feature Scope

### Authentication

- [x] Email/password registration
- [x] Google OAuth login
- [x] Facebook OAuth login
- [x] Password reset flow
- [x] Email verification
- [ ] Phone number verification (deferred to Phase 2)

### User Profiles

- [x] Profile creation with name, bio, avatar
- [x] Phone number (optional)
- [x] Address and location (map picker)
- [x] Profile photo upload
- [x] View other user profiles
- [x] Basic profile editing

### Job Posting

- [x] Create job with title, description, budget
- [x] Select category (babysitting, cleaning, food)
- [x] Set location with map
- [x] Upload up to 5 photos
- [x] Schedule date/time (optional)
- [x] Edit and delete own jobs
- [x] Job status management (open, in progress, completed, cancelled)

### Job Discovery

- [x] Browse jobs by category
- [x] Search jobs by keyword
- [x] Filter by location radius
- [x] Sort by date, price, distance
- [x] View job details
- [x] Pagination / infinite scroll

### Offers System

- [x] Submit offer on a job
- [x] Include price and message
- [x] View offers on own jobs
- [x] Accept/reject offers
- [x] Withdraw own offer
- [x] Notification on offer status change

### In-App Chat

- [x] Create conversation when offer accepted
- [x] Real-time messaging (Socket.io)
- [x] Send text messages
- [x] Send images
- [x] Message read receipts
- [x] Push notifications for new messages
- [ ] Typing indicators (deferred)
- [ ] Voice messages (deferred)

### Reviews

- [x] Leave review after job completion
- [x] 1-5 star rating
- [x] Written feedback
- [x] View user's review history
- [x] Calculate average rating

### Notifications

- [x] Push notifications (Firebase FCM)
- [x] New offer received
- [x] Offer accepted/rejected
- [x] New message
- [x] Job status changes
- [x] In-app notification center

### Ads Integration

- [x] Google AdMob (mobile)
  - Banner ads on job list
  - Interstitial ads between screens
- [x] Google AdSense (web)
  - Banner ads in sidebar
  - In-feed native ads

---

## Technical Implementation

### Infrastructure (Free Tier)

| Service            | Provider          | Free Tier Limits             |
| ------------------ | ----------------- | ---------------------------- |
| Web Hosting        | Vercel            | 100GB bandwidth/month        |
| Database           | Supabase          | 500MB, 2 projects            |
| Auth               | Firebase          | 10K verifications/month      |
| Images             | Cloudinary        | 25GB storage, 25GB bandwidth |
| Push Notifications | Firebase FCM      | Unlimited                    |
| Analytics          | Firebase + Vercel | Free                         |
| Error Tracking     | Sentry            | 5K errors/month              |

### Database Schema (Core)

```
Users
├── id, email, name, avatar, phone
├── address, latitude, longitude
├── role, rating, reviewCount
└── timestamps

Jobs
├── id, title, description, category
├── budget, currency, status
├── location, latitude, longitude
├── posterId, providerId
└── timestamps

JobImages
├── id, jobId, url, publicId, order
└── timestamps

Offers
├── id, jobId, providerId
├── price, message, isAccepted
└── timestamps

Reviews
├── id, jobId, authorId, targetId
├── rating, comment
└── timestamps

Conversations
├── id, jobId
└── timestamps

Messages
├── id, conversationId, senderId
├── content, imageUrl, isRead
└── timestamps
```

### API Endpoints (Phase 1)

```
Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/social
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

Users
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/:id
GET    /api/users/:id/reviews

Jobs
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
POST   /api/jobs/:id/images
DELETE /api/jobs/:id/images/:imageId
PATCH  /api/jobs/:id/status

Offers
GET    /api/jobs/:id/offers
POST   /api/jobs/:id/offers
PATCH  /api/offers/:id/accept
PATCH  /api/offers/:id/reject
DELETE /api/offers/:id

Reviews
POST   /api/jobs/:id/reviews
GET    /api/reviews/:id

Chat
GET    /api/conversations
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages
WS     /api/socket
```

---

## Mobile App Screens

### Auth Flow

1. **Welcome** - App intro with login/register buttons
2. **Login** - Email/password + social buttons
3. **Register** - Name, email, password form
4. **Forgot Password** - Email input
5. **Verify Email** - Code input screen

### Main Tabs

1. **Home** - Featured jobs, categories, search
2. **Browse** - Job listings with filters
3. **Post** - Create new job
4. **Messages** - Conversation list
5. **Profile** - User profile and settings

### Job Flow

1. **Job List** - Cards with image, title, price, location
2. **Job Detail** - Full info, photos, map, offer button
3. **Create Job** - Multi-step form
4. **My Jobs** - Posted and accepted jobs
5. **Job Management** - Status updates, view offers

### Chat Flow

1. **Conversation List** - Recent chats with preview
2. **Chat Room** - Messages, input, send image

### Profile Flow

1. **My Profile** - View mode
2. **Edit Profile** - Form with image upload
3. **User Profile** - Other user's public profile
4. **Reviews** - Review list
5. **Settings** - Notifications, logout

---

## Web PWA Pages

```
/                     # Home - hero, categories, featured
/jobs                 # Browse jobs
/jobs/[id]            # Job detail
/jobs/new             # Create job (auth required)
/messages             # Conversations (auth required)
/messages/[id]        # Chat room
/profile              # My profile (auth required)
/profile/edit         # Edit profile
/users/[id]           # Public user profile
/login                # Login page
/register             # Register page
/forgot-password      # Password reset
```

---

## Milestones

### Week 1-2: Project Setup

- [ ] Initialize monorepo with Turborepo
- [ ] Setup Next.js web app
- [ ] Setup React Native Expo app
- [ ] Configure Tailwind + shadcn/ui
- [ ] Setup Prisma with Supabase
- [ ] Configure Firebase project
- [ ] Setup Cloudinary account
- [ ] Create shared packages structure

### Week 3-4: Authentication

- [ ] Implement Firebase Auth integration
- [ ] Build login/register screens (mobile)
- [ ] Build login/register pages (web)
- [ ] Social login (Google, Facebook)
- [ ] Protected routes middleware
- [ ] User session management

### Week 5-6: Core Features

- [ ] User profile CRUD
- [ ] Job posting CRUD
- [ ] Image upload to Cloudinary
- [ ] Job listing with filters
- [ ] Location/map integration
- [ ] Offer submission system

### Week 7-8: Communication

- [ ] Conversation creation
- [ ] Real-time chat with Socket.io
- [ ] Push notifications setup
- [ ] In-app notification center
- [ ] Message read receipts

### Week 9-10: Reviews & Polish

- [ ] Review system
- [ ] Rating calculations
- [ ] UI/UX polish
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### Week 11-12: Ads & Launch

- [ ] Google AdMob integration (mobile)
- [ ] Google AdSense integration (web)
- [ ] Performance optimization
- [ ] Testing & bug fixes
- [ ] App store submissions
- [ ] Production deployment

---

## Deployment Checklist

### Pre-Launch

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates active
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Legal pages (Privacy, Terms)

### Vercel (Web)

- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Enable analytics
- [ ] Configure custom domain
- [ ] Setup preview deployments

### Supabase (Database)

- [ ] Create production project
- [ ] Run migrations
- [ ] Enable connection pooling
- [ ] Configure row-level security
- [ ] Setup automated backups

### Firebase

- [ ] Create production project
- [ ] Enable auth providers
- [ ] Configure OAuth redirect URLs
- [ ] Setup FCM for push notifications
- [ ] Download and configure credentials

### App Stores

- [ ] Apple Developer account ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] Prepare app icons and screenshots
- [ ] Write app descriptions
- [ ] Configure app signing
- [ ] Submit for review

---

## Success Metrics

| Metric               | Target (Month 1) | Target (Month 3) |
| -------------------- | ---------------- | ---------------- |
| Registered Users     | 500              | 2,000            |
| Monthly Active Users | 200              | 1,000            |
| Jobs Posted          | 100              | 500              |
| Jobs Completed       | 30               | 200              |
| App Store Rating     | 4.0+             | 4.2+             |
| Ad Revenue           | $50              | $300             |

---

## Risks & Mitigations

| Risk                      | Impact             | Mitigation                           |
| ------------------------- | ------------------ | ------------------------------------ |
| Free tier limits exceeded | Service disruption | Monitor usage, upgrade plan          |
| Low user adoption         | No revenue         | Marketing, referral program          |
| App store rejection       | Launch delay       | Follow guidelines, test thoroughly   |
| Security vulnerabilities  | Data breach        | Security audit, OWASP compliance     |
| Poor performance          | User churn         | Performance monitoring, optimization |

---

## Budget (Phase 1)

| Item                  | Cost           |
| --------------------- | -------------- |
| Apple Developer       | $99/year       |
| Google Play Developer | $25 (one-time) |
| Domain                | ~$15/year      |
| Infrastructure        | $0 (free tier) |
| **Total Year 1**      | **~$140**      |
