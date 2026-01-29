# Phase 2: Monetization & Growth

**Duration**: 12-16 weeks
**Goal**: Implement commission-based revenue model and paid promotions
**Prerequisites**: Phase 1 complete, 1,000+ active users

---

## Objectives

1. Implement Stripe payment processing
2. Launch commission system (Booking.com model)
3. Add paid promotion features
4. Migrate to AWS for scalability
5. Improve user experience based on Phase 1 feedback

---

## Business Model

### Commission Structure

| Category | Commission Rate |
|----------|-----------------|
| Babysitting | 10% |
| House Cleaning | 12% |
| Local Food | 15% |

**How it works:**
1. Provider completes a job
2. Client confirms completion
3. Payment is processed through Stripe
4. Commission is deducted automatically
5. Provider receives payout (minus commission)

### Promotion Tiers

| Tier | Price | Duration | Benefits |
|------|-------|----------|----------|
| Basic | $4.99 | 7 days | Highlighted in listings |
| Premium | $9.99 | 7 days | Top of category, badge |
| Featured | $19.99 | 7 days | Homepage feature, all Premium benefits |

---

## Feature Scope

### Payment System
- [ ] Stripe Connect integration
- [ ] Provider onboarding (bank account)
- [ ] Secure payment collection
- [ ] Escrow until job completion
- [ ] Automatic commission deduction
- [ ] Provider payouts
- [ ] Payment history
- [ ] Invoices and receipts
- [ ] Refund handling
- [ ] Dispute resolution

### Promotion System
- [ ] Promotion purchase flow
- [ ] Tier selection
- [ ] Payment processing
- [ ] Automatic activation
- [ ] Promoted job badges
- [ ] Homepage featured section
- [ ] Promotion analytics
- [ ] Auto-renewal option

### Enhanced Features
- [ ] Identity verification (ID upload)
- [ ] Background check integration
- [ ] Advanced search filters
- [ ] Saved searches
- [ ] Favorite providers
- [ ] Job templates
- [ ] Recurring jobs
- [ ] Multi-language support
- [ ] Accessibility improvements

### Provider Dashboard
- [ ] Earnings overview
- [ ] Payout history
- [ ] Performance analytics
- [ ] Job statistics
- [ ] Review insights
- [ ] Promotion ROI

### Admin Dashboard
- [ ] User management
- [ ] Job moderation
- [ ] Report handling
- [ ] Revenue analytics
- [ ] Commission tracking
- [ ] Promotion management
- [ ] System health monitoring

---

## Technical Implementation

### AWS Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront                           │
│                     (CDN + SSL/TLS)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Application Load Balancer                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │   ECS   │     │   ECS   │     │   ECS   │
    │ Task 1  │     │ Task 2  │     │ Task N  │
    │(Fargate)│     │(Fargate)│     │(Fargate)│
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼───┐          ┌────▼────┐         ┌────▼────┐
│  RDS  │          │   S3    │         │ ElastiC │
│ Postgres│        │ (Files) │         │  ache   │
└───────┘          └─────────┘         │ (Redis) │
                                       └─────────┘
```

### AWS Services

| Service | Purpose | Estimated Cost |
|---------|---------|----------------|
| ECS Fargate | Application hosting | ~$50/month |
| RDS PostgreSQL | Database | ~$30/month |
| S3 | File storage | ~$5/month |
| CloudFront | CDN | ~$10/month |
| ElastiCache | Redis caching | ~$15/month |
| SES | Transactional email | ~$5/month |
| SQS | Background jobs | ~$2/month |
| CloudWatch | Monitoring | ~$10/month |
| **Total** | | **~$130/month** |

### Database Schema (Additions)

```prisma
model Payment {
  id                String        @id @default(cuid())
  jobId             String        @unique
  job               Job           @relation(fields: [jobId], references: [id])
  amount            Decimal       @db.Decimal(10, 2)
  commission        Decimal       @db.Decimal(10, 2)
  commissionRate    Decimal       @db.Decimal(5, 4)
  providerPayout    Decimal       @db.Decimal(10, 2)
  currency          String        @default("USD")
  status            PaymentStatus @default(PENDING)
  stripePaymentId   String?
  stripeTransferId  String?
  paidAt            DateTime?
  transferredAt     DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([status])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  DISPUTED
}

model ProviderProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  stripeAccountId     String?   @unique
  stripeOnboarded     Boolean   @default(false)
  identityVerified    Boolean   @default(false)
  backgroundChecked   Boolean   @default(false)
  totalEarnings       Decimal   @db.Decimal(12, 2) @default(0)
  pendingPayout       Decimal   @db.Decimal(10, 2) @default(0)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model Promotion {
  id          String          @id @default(cuid())
  jobId       String
  job         Job             @relation(fields: [jobId], references: [id])
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  tier        PromotionTier
  price       Decimal         @db.Decimal(10, 2)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean         @default(true)
  autoRenew   Boolean         @default(false)
  paymentId   String?
  createdAt   DateTime        @default(now())

  @@index([isActive, endDate])
  @@index([tier, isActive])
}

enum PromotionTier {
  BASIC
  PREMIUM
  FEATURED
}

model Payout {
  id              String       @id @default(cuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  amount          Decimal      @db.Decimal(10, 2)
  currency        String       @default("USD")
  status          PayoutStatus @default(PENDING)
  stripePayoutId  String?
  processedAt     DateTime?
  createdAt       DateTime     @default(now())

  @@index([userId, status])
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Report {
  id          String       @id @default(cuid())
  reporterId  String
  reporter    User         @relation("ReportsMade", fields: [reporterId], references: [id])
  targetType  ReportTarget
  targetId    String
  reason      String
  description String?
  status      ReportStatus @default(PENDING)
  resolvedAt  DateTime?
  resolvedBy  String?
  createdAt   DateTime     @default(now())

  @@index([status])
}

enum ReportTarget {
  USER
  JOB
  MESSAGE
  REVIEW
}

enum ReportStatus {
  PENDING
  INVESTIGATING
  RESOLVED
  DISMISSED
}
```

### New API Endpoints

```
Payments
POST   /api/payments/intent           # Create payment intent
POST   /api/payments/confirm          # Confirm payment
GET    /api/payments/:id              # Get payment details
POST   /api/payments/:id/refund       # Request refund

Provider
POST   /api/provider/onboard          # Start Stripe onboarding
GET    /api/provider/dashboard        # Get earnings dashboard
GET    /api/provider/payouts          # List payouts
POST   /api/provider/payout           # Request payout

Promotions
GET    /api/promotions/tiers          # Get promotion tiers
POST   /api/jobs/:id/promote          # Purchase promotion
DELETE /api/promotions/:id            # Cancel promotion

Admin
GET    /api/admin/users               # List users
PATCH  /api/admin/users/:id           # Update user
GET    /api/admin/jobs                # List all jobs
DELETE /api/admin/jobs/:id            # Remove job
GET    /api/admin/reports             # List reports
PATCH  /api/admin/reports/:id         # Resolve report
GET    /api/admin/analytics           # Dashboard analytics
```

---

## Stripe Integration

### Connect Onboarding Flow

```typescript
// 1. Create Connect account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: user.email,
  capabilities: {
    transfers: { requested: true },
  },
});

// 2. Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${APP_URL}/provider/onboard/refresh`,
  return_url: `${APP_URL}/provider/onboard/complete`,
  type: 'account_onboarding',
});

// 3. After completion, verify account
const account = await stripe.accounts.retrieve(accountId);
if (account.charges_enabled && account.payouts_enabled) {
  // Provider is ready to receive payments
}
```

### Payment Flow

```typescript
// 1. Create payment intent when job accepted
const paymentIntent = await stripe.paymentIntents.create({
  amount: jobAmount * 100, // cents
  currency: 'usd',
  customer: clientStripeId,
  transfer_data: {
    destination: providerStripeAccountId,
  },
  application_fee_amount: commission * 100,
  metadata: {
    jobId: job.id,
    clientId: client.id,
    providerId: provider.id,
  },
});

// 2. Confirm payment on client side
// 3. Job completion triggers transfer
// 4. Commission stays in platform account
```

---

## Milestones

### Week 1-3: AWS Migration
- [ ] Setup AWS accounts and IAM
- [ ] Configure VPC and networking
- [ ] Deploy RDS PostgreSQL
- [ ] Migrate data from Supabase
- [ ] Setup ECS Fargate cluster
- [ ] Configure S3 for file storage
- [ ] Setup CloudFront CDN
- [ ] Configure CI/CD pipeline

### Week 4-6: Payment Infrastructure
- [ ] Stripe account setup
- [ ] Implement Connect onboarding
- [ ] Build payment intent flow
- [ ] Implement escrow logic
- [ ] Build payout system
- [ ] Add payment history
- [ ] Implement refund handling

### Week 7-9: Promotion System
- [ ] Design promotion tiers
- [ ] Build promotion purchase flow
- [ ] Implement promotion display logic
- [ ] Add featured section on homepage
- [ ] Build promotion analytics
- [ ] Implement auto-renewal

### Week 10-12: Enhanced Features
- [ ] Identity verification
- [ ] Provider dashboard
- [ ] Advanced search
- [ ] Favorites system
- [ ] Job templates
- [ ] Recurring jobs

### Week 13-15: Admin & Polish
- [ ] Build admin dashboard
- [ ] User management
- [ ] Content moderation
- [ ] Report handling
- [ ] Analytics dashboard
- [ ] Performance optimization

### Week 16: Launch
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Staged rollout
- [ ] Monitor and fix issues

---

## Migration Strategy

### Data Migration (Supabase → AWS RDS)

```bash
# 1. Export from Supabase
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# 2. Import to RDS
psql -h xxx.rds.amazonaws.com -U admin -d localservices < backup.sql

# 3. Verify data integrity
# 4. Update connection strings
# 5. Switch traffic
```

### File Migration (Cloudinary → S3)

```typescript
// Batch migrate images
async function migrateImages() {
  const images = await prisma.jobImage.findMany();

  for (const image of images) {
    // Download from Cloudinary
    const response = await fetch(image.url);
    const buffer = await response.buffer();

    // Upload to S3
    const key = `jobs/${image.jobId}/${image.id}.jpg`;
    await s3.upload({
      Bucket: 'localservices-images',
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    }).promise();

    // Update database
    await prisma.jobImage.update({
      where: { id: image.id },
      data: { url: `https://cdn.localservices.com/${key}` },
    });
  }
}
```

---

## Revenue Projections

### Month 1-3 (Transition)

| Source | Projection |
|--------|------------|
| Google Ads (continuing) | $300/month |
| Commissions (10% avg) | $500/month |
| Promotions | $200/month |
| **Total** | **$1,000/month** |

### Month 4-6 (Growth)

| Source | Projection |
|--------|------------|
| Google Ads | $500/month |
| Commissions | $2,000/month |
| Promotions | $800/month |
| **Total** | **$3,300/month** |

### Month 7-12 (Scale)

| Source | Projection |
|--------|------------|
| Google Ads | $800/month |
| Commissions | $8,000/month |
| Promotions | $2,500/month |
| **Total** | **$11,300/month** |

---

## Success Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Monthly Active Users | 5,000 | 15,000 |
| Jobs Completed | 1,000 | 4,000 |
| Provider Onboarded | 200 | 800 |
| Gross Transaction Value | $50,000 | $200,000 |
| Commission Revenue | $5,000 | $20,000 |
| Promotion Revenue | $1,500 | $5,000 |
| Provider Retention | 70% | 75% |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration downtime | User churn | Blue-green deployment |
| Payment fraud | Financial loss | Stripe Radar, manual review |
| User resistance to fees | Adoption drop | Gradual rollout, communication |
| AWS cost overrun | Budget impact | Cost alerts, reserved instances |
| Stripe account issues | Payment blocked | Backup processor, compliance |

---

## Budget (Phase 2)

| Item | Monthly Cost |
|------|--------------|
| AWS Infrastructure | $130 |
| Stripe fees (2.9% + $0.30) | Variable |
| Domain & SSL | $2 |
| Error tracking (Sentry Pro) | $26 |
| Analytics (Mixpanel) | $0 (free tier) |
| **Total Fixed** | **~$160/month** |

### One-Time Costs

| Item | Cost |
|------|------|
| Security audit | $2,000 |
| Legal review (ToS, Privacy) | $1,500 |
| Background check API setup | $500 |
| **Total** | **$4,000** |
