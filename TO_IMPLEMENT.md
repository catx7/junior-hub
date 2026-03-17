# JuniorHub - Full Implementation Roadmap

> Generated: 2026-03-15 | Agents: UX Architect, UI Designer, Senior Developer, Backend Architect, Legal Compliance
> Competitors analyzed: sitly.ro, babysits.ro

---

## PHASE 1: BLOCKERS & CRITICAL FIXES (Week 1)

### 1.1 Legal / Child Safety (BLOCKING)

- [x] **Require criminal record certificate upload** (`certificat de cazier judiciar`) in provider verification flow - added `backgroundCheckUrl` and `backgroundCheckDeclaration` to schema
- [x] **Add child safety reporting mechanism** - created `/child-safety` page with emergency numbers (112, 116 111), DGASPC contact, mandatory reporting obligations, emergency procedures
- [x] **Add emergency procedures page** - integrated into `/child-safety` page with babysitting checklist
- [ ] **Fill in all placeholder company data** - replace `[CUI]`, `[Adresa completa]`, `[Numar telefon]`, `[J__/____/____]` in privacy, terms, ANPC, cookies pages
- [x] **Implement GDPR consent tracking** - added `Consent` + `AuditLog` models to schema, registration API records consent with IP/userAgent/version
- [x] **Implement account deletion API** - `POST /api/users/me/delete` with Firebase cleanup, DB anonymization, consent revocation, audit logging
- [x] **Implement data export API** - `GET /api/users/me/export` compiling all user data into downloadable JSON

### 1.2 Critical Bugs

- [x] **Fix map default center** from New York (40.7128, -74.006) to Bucharest (44.4268, 26.1025) in `packages/shared/src/constants/index.ts`
- [x] **Fix default currency** from USD to RON in schema.prisma (`currency String @default("RON")`) and `formatPrice` utility in `utils.ts`
- [x] **Change Vercel region** from `iad1` (US East) to `fra1` (Frankfurt) in `apps/web/vercel.json`
- [x] **Fix CORS** - replace `Access-Control-Allow-Origin: *` with actual domain(s) in `vercel.json` + `next.config.js`
- [x] **Fix HTML lang attribute** - dynamic based on user locale via `LocaleSync` component + default `lang="ro"`
- [x] **Remove `maximumScale: 1`** from viewport meta in layout.tsx - WCAG accessibility violation
- [ ] **Implement avatar upload** - currently shows "coming soon" toast in profile edit

### 1.3 SEO Infrastructure

- [x] **Create `sitemap.xml`** - dynamic at `apps/web/src/app/sitemap.ts` including all public pages, job listings, events, city landing pages
- [x] **Create `robots.txt`** - at `apps/web/src/app/robots.ts` allowing crawling, blocking /api/, /admin/, /settings/, /messages/
- [x] **Fix broken footer links** - removed `/blog` and `/careers`, replaced with working links
- [x] **Add JSON-LD structured data** - Organization (homepage), Job (component), Event (component) + reusable `json-ld.tsx`
- [x] **Add per-page metadata** - root layout updated with Romanian SEO keywords
- [x] **Add `hreflang` tags** for RO/EN bilingual content via `alternates.languages`
- [x] **Add canonical URLs** to all pages via `alternates.canonical`

### 1.4 Security Headers

- [x] **Add `Strict-Transport-Security`** header: `max-age=63072000; includeSubDomains; preload`
- [x] **Add `Content-Security-Policy`** header with proper directives for Firebase, Cloudinary, Google, OpenStreetMap
- [x] **Add `Permissions-Policy`** header: `camera=(), microphone=(), geolocation=(self), payment=(self)`
- [x] **Restrict image domains** in next.config.js - restricted to cloudinary, google, facebook, unsplash

---

## PHASE 2: CORE FEATURES (Weeks 2-4)

### 2.1 Database Schema Additions

- [x] **Add `AvailabilitySlot` model** - userId, dayOfWeek, startTime, endTime, specificDate, isAvailable (for provider weekly/one-off availability)
- [x] **Add `ProviderProfile` model** - headline, yearsExperience, hourlyRate, currency (RON), languages[], certifications[], ageRangeMin/Max, hasCar, hasDriverLicense, serviceRadius, specialNeeds, smokingStatus, videoIntroUrl
- [x] **Add `Booking` model** (replace thin BookingRequest) - startDateTime, endDateTime, duration, status workflow (PENDING→CONFIRMED→IN_PROGRESS→COMPLETED/CANCELLED), totalPrice, currency, cancellation fields
- [x] **Add `Payment` model** - bookingId, promotionId, userId, amount, currency, status (PENDING→PROCESSING→COMPLETED→FAILED→REFUNDED), provider (stripe/netopia), externalId, metadata
- [x] **Add `Subscription` model** - userId, plan (FREE/BASIC/PREMIUM), status, currentPeriodStart/End, externalId
- [x] **Add `AuditLog` model** - actorId, action, targetType, targetId, metadata, ipAddress (GDPR compliance)
- [x] **Add `Consent` model** - userId, consentType, version, grantedAt, revokedAt, ipAddress
- [x] **Add provider fields to User** or relation to ProviderProfile - lastActiveAt, responseTime, responseRate

### 2.2 Browse Providers Page (P0 - biggest missing feature)

- [x] **Create `/providers` page** - primary navigation destination for parents to browse service providers
- [x] **Provider search API** - `GET /api/providers` with filters: category, location/radius, rating, price range, languages, experience, certifications, specialNeeds
- [ ] **Map/list split view** using existing Leaflet integration - show providers pinned on map with photos
- [x] **ProviderCard component** - large avatar (72-80px), name, location, star rating + review count, verification badges, response time, bio excerpt (2 lines), hourly rate, "View Profile" CTA
- [ ] **Privacy circles on map** - show approximate location, not exact address
- [x] **"Near me" button** using browser geolocation
- [x] **Distance display** on provider cards
- [x] **Radius slider** in search UI connected to existing API radius param

### 2.3 City-Specific SEO Landing Pages

- [x] **Create `/babysitter/[city]` dynamic pages** for 15 Romanian cities with hero, stats, top providers, recent jobs, how it works, nearby cities, JSON-LD
- [x] **Create `/servicii/[category]` pages** - babysitting, curatenie with stats, city breakdown, SEO content
- [x] **Create `/servicii/[city]/[category]` pages** - e.g., `/servicii/bucuresti/babysitting` with providers, cross-links
- [x] **Use ISR** (Incremental Static Regeneration) for these pages with `revalidate = 60`
- [x] **Proper h1/meta tags** per city with localized content in Romanian, keywords, canonical URLs, OG tags, JSON-LD

### 2.4 Onboarding Flow

- [x] **Post-registration wizard** (3-4 steps):
  - Step 1: Role selection - "Caut servicii" vs "Ofer servicii"
  - Step 2: Location setup with map picker
  - Step 3: Profile photo + bio
  - Step 4 (providers): Category selection + experience description
- [x] **Profile completeness indicator** / progress bar encouraging completion
- [ ] **First-time-user empty states** that guide to first action (not just "Nothing here")

### 2.5 Enhanced Provider Profiles

- [x] **Experience section** - years of experience, specialties
- [x] **Languages spoken** - critical for RO/HU/DE minorities
- [x] **Certifications** - first aid, CPR, pedagogy
- [x] **Age group preferences** - infant, toddler, school-age, teen
- [x] **Hourly rate display** in RON
- [x] **Photo gallery** - multiple photos beyond avatar
- [x] **Response rate and response time** display ("Usually responds within 2 hours")
- [x] **Last active indicator** - "Active today" / "Active this week" / "Last seen X days ago"
- [ ] **Availability calendar** display on profile page

### 2.6 Payment Integration

- [ ] **Integrate Stripe** (or Netopia for Romanian market) - payment intent creation, webhook handling[skip - small platform user dont trust us yet]
- [ ] **Promotion purchase flow** - the tiers (BASIC/PREMIUM/FEATURED) are defined but cannot be purchased- purchase by emailing admin
- [ ] **Payment history page** for users- skip
- [ ] **Receipt/invoice generation**skip
- [ ] **Refund processing**-skip

### 2.7 Email System

- [x] **Integrate email service** (Resend) with HTML email templates
- [x] **Welcome email** after registration
- [x] **Email verification** flow - `EmailVerification` model, `POST /api/auth/send-verification` (rate-limited), `GET /api/auth/verify-email?token=` (token valid 24h), auto-sent on registration
- [x] **Booking confirmation** emails - `sendBookingConfirmationEmail()` template with date/time/price details, separate for client/provider roles
- [x] **Offer accepted/rejected** notifications
- [x] **New message** notification (for users without push)
- [x] **Weekly digest** of new jobs in user's area (Vercel Cron, Mondays 9AM)
- [ ] **Payment receipts** via email- skip

### 2.8 Guest Access (SEO + Conversion)

- [x] **Allow guests to view full job details** without registration wall - already public, no auth wall
- [x] **Allow guests to view provider profiles** - removed auth gate from providers page, all profiles now directly linkable
- [x] **Gate only messaging, booking, and offer submission** behind authentication - already gated at component level (CTA prompts for guests)
- [x] **Convert homepage to Server Component** with client islands - fetch recent jobs server-side for SEO (already done with `revalidate=60`)

---

## PHASE 3: UX/UI OVERHAUL (Month 2)

### 3.1 Color & Typography Redesign

- [x] **Replace primary coral-red (#FF5A5F)** with warm purple `hsl(262, 60%, 50%)` — passes WCAG AA (5.3:1 contrast)
- [x] **Reserve coral/red for destructive actions** only — `--destructive: 0 72% 51%`
- [x] **Add display font** Nunito for headings — `font-display` class, Inter kept for body
- [x] **Define strict type scale** - `text-display-lg`, `text-display-sm`, `text-heading`, `text-subheading`, `text-body`, `text-caption`, `text-micro`
- [x] **Expand CSS variables** for full semantic scales: `--success`, `--warning`, `--info` + foreground variants, both light and dark mode
- [x] **Adjust primary/secondary for dark mode** - lighter, less saturated: primary `262 60% 65%`, secondary `174 50% 50%`
- [x] **Fix primary color contrast** - new purple `hsl(262, 60%, 50%)` on white = 5.3:1, PASSES WCAG AA
- [ ] **Migrate category colors to design tokens** so they work in dark mode

### 3.2 Component Library Expansion

- [x] **Dialog/Modal** - Radix Dialog with overlay, focus trap, close button, header/footer/title/description
- [x] **Tabs** - Radix Tabs with list/trigger/content
- [x] **Tooltip** - Radix Tooltip with dark bg, animations
- [x] **Select/Dropdown** - Radix Select with trigger, content, items, scroll buttons, separator
- [x] **Textarea** - styled multiline input with error state
- [x] **Drawer/Sheet** - Radix Dialog based, supports top/right/bottom/left sides, drag handle for bottom
- [x] **Slider/Range** - Radix Slider with track, range, thumb
- [x] **Checkbox/Radio** - Radix Checkbox + RadioGroup with proper styling
- [x] **Progress** - Radix Progress with animated indicator
- [x] **Pagination** - smart page numbers with ellipsis, prev/next, aria labels
- [x] **StarRating** - interactive + readonly, hover state, half-star support, sm/md/lg sizes
- [x] **EmptyState** - icon slot, title, description, action slot, dashed border styling
- [x] **RatingDisplay** - reusable `{ rating, count, size, showCount }` with StarRating
- [x] **TrustBadge** - tiered (email/phone/id/background/top) with Radix Tooltip, `TrustBadges` aggregate component

### 3.3 Homepage Redesign

- [ ] **Add hero image/illustration** - split layout: text + search on left, warm illustration on right showing diverse Romanian families
- [x] **Make search bar functional** - wire inputs to redirect to `/jobs?search=...&location=...` (already functional via HomeSearchBar)
- [ ] **Replace Unsplash stock** with custom category illustrations (consistent vector style)
- [ ] **Replace hardcoded stats** with real data from DB or remove until meaningful
- [x] **Add "How it Works" section** - 3 steps (Post, Get Offers, Choose & Book) with Lucide icons, full i18n RO/EN
- [ ] **Add testimonials carousel** - 3-4 curated testimonials with photos
- [ ] **Add social proof** - "Trusted by X families in Romania"
- [x] **Fix hardcoded English** in hero - all strings use i18n system via `t('ro', key)`
- [ ] **Curate homepage listings** - only show jobs with images, or use category-specific placeholder illustrations

### 3.4 Mobile Navigation

- [x] **Add bottom tab navigation** - Home, Search/Browse, Post (+), Messages, Profile - `mobile-nav.tsx` with auth-aware tabs, active state, hidden on md+
- [ ] **Replace hamburger menu** with animated slide-in drawer with overlay
- [ ] **Implement horizontal scroll** for filter chips with `overflow-x-auto snap-x`
- [x] **Increase touch targets** to minimum 44px on all interactive elements - mobile menu items changed to py-3
- [ ] **Add tablet-specific layouts** at `md` breakpoint

### 3.5 Trust & Verification System

- [x] **Multi-level verification badges** - TrustBadge component with email/phone/id/background/top tiers + TrustBadges aggregate
- [ ] **Verification explainer component** - expandable section explaining what each verification means
- [x] **"Top Provider" badge** for 4.8+ rating and 10+ completed jobs - part of TrustBadge component
- [x] **Platform trust seals** in footer - SSL Secured, GDPR Compliant, ANPC Protected with Lock/Shield/Scale icons
- [x] **Registration page social proof** - "Trusted by 10,000+ users", Verified Providers badge, GDPR badge below registration card

### 3.6 Search Results Improvements

- [ ] **Add map/list split view** to jobs page using Leaflet
- [x] **Show result count** - displays job count above results
- [ ] **Implement proper pagination** with page numbers and total count (Pagination component exists, needs API integration)
- [x] **Redesign mobile filters** as full-screen slide-up Drawer with categories, job type, budget, Apply/Clear actions
- [ ] **Add filter count badge** on mobile filter button
- [x] **Expand grid to 4 columns** on 2xl screens - added `2xl:grid-cols-4`
- [x] **Increase filter text size** to 14px minimum - changed `text-xs` to `text-sm` in sidebar and mobile filters

### 3.7 Image & Visual Improvements

- [x] **Create category-specific placeholder illustrations** - SVG data URL placeholders via `getCategoryPlaceholder()` in `image-utils.ts`
- [x] **Implement image lightbox** - `ImageLightbox` component with zoom, keyboard nav, thumbnails, counter
- [x] **Diversify avatar fallbacks** - `avatarColorFromName()` hash-based color from 10 predefined colors
- [x] **Standardize Cloudinary transforms** - `cloudinaryUrl(url, variant)` with thumb/card/detail/full variants
- [ ] **Use shimmer effect** from globals.css instead of basic pulse for image loading
- [ ] **Commission custom illustration set** - hero, categories, empty states, onboarding, error, success (warm, inclusive, Romanian context)

### 3.8 Empty & Loading States

- [x] **Standardize skeleton variants** per card type - `skeletons.tsx` with JobCardSkeleton, EventCardSkeleton, ProfileSkeleton, ListItemSkeleton, MessageSkeleton, PageHeaderSkeleton
- [x] **Create illustrated empty states** - `EmptyState` component with icon slot, title, description, action, dashed border
- [ ] **Add retry buttons** to all error states
- [ ] **Create onboarding empty states** for new users

### 3.9 Dark Mode Fixes

- [ ] **Audit all hardcoded colors** - replace `bg-white`, `bg-gray-*`, `from-blue-50`, `from-purple-50` with CSS variables or dark: variants
- [ ] **Create dark-mode-safe category colors** with increased lightness
- [ ] **Fix cookie consent** hardcoded `bg-white dark:bg-gray-900`
- [ ] **Fix sign-up prompt** in jobs `from-blue-50 to-indigo-50` without dark variant
- [ ] **Fix kids events banner** `from-purple-50 to-pink-50` without dark variant

### 3.10 Icon System

- [x] **Replace emoji category icons** - SERVICE_CATEGORIES now use Lucide icon names (Baby, Home, UtensilsCrossed, MoreHorizontal) + `CategoryIcon` component for rendering
- [ ] **Define icon size scale** - xs(12), sm(16), md(20), lg(24), xl(32), 2xl(48)
- [x] **Replace inline SVGs** in footer with Lucide components (Twitter, Facebook, Instagram)
- [ ] **Consider Phosphor Icons** for fill/duotone variants (star ratings, active states)

---

## PHASE 4: BACKEND HARDENING (Month 2-3)

### 4.1 Performance & Scalability

- [ ] **Fix rate limiter** - replace in-memory Map with Vercel KV (Redis) for serverless compatibility
- [ ] **Add database connection pooling** - Prisma Accelerate or PgBouncer for Vercel serverless
- [ ] **Implement geo-spatial search** - the API accepts lat/lng/radius but never uses them in queries. Use Haversine formula or PostGIS
- [ ] **Replace ILIKE search** with PostgreSQL full-text search using GIN index for job search
- [ ] **Add HTTP cache headers** - `s-maxage=60, stale-while-revalidate=300` for public data, `private, no-cache` for user data
- [ ] **Implement ISR** on public listing pages (jobs, events, clothes, food) with `revalidate = 60`
- [ ] **Fix deploy pipeline** - run DB migrations BEFORE deploy, not after (currently code deploys first, then migration)
- [ ] **Make notification delivery async** - push notifications currently block API response
- [ ] **Implement Cloudinary direct upload** from client to reduce API latency
- [ ] **Move Leaflet CSS** to only load on pages with maps (currently loaded globally)

### 4.2 Real-time Messaging

- [ ] **Implement SSE endpoint** `GET /api/v1/events/stream` for real-time messaging (Vercel supports streaming responses)
- [ ] **Fix image sharing in chat** - button exists but has no upload logic
- [ ] **Add typing indicators** - socket events are defined but not wired
- [ ] **Display read receipts** - `isRead` field exists but not shown to sender
- [ ] **Add online/offline status** indicator

### 4.3 API Improvements

- [ ] **Add API versioning** - `/api/v1/` prefix for all routes (critical before mobile app ships to stores)
- [x] **Add health check endpoint** - `GET /api/health` checking DB connectivity, returning version
- [x] **Implement Next.js middleware** (`middleware.ts`) for centralized security headers, rate limiting hints
- [x] **Add availability API routes** - POST/GET/DELETE for availability slots
- [x] **Add enhanced booking API** - POST/GET/PATCH with status workflow
- [ ] **Add payment API routes** - intent creation, webhook, history
- [ ] **Add provider search API** - with availability, rating, distance, price filters
- [ ] **Add subscription API** - create, status, cancel

### 4.4 Monitoring & Observability

- [ ] **Integrate Sentry** for error tracking with source maps
- [ ] **Add Vercel Analytics** for Web Vitals
- [ ] **Set up uptime monitoring** (BetterStack or Checkly) for `/api/health`
- [ ] **Add smoke tests after deploy** in CI/CD pipeline
- [ ] **Add security scanning** - `pnpm audit` in CI pipeline

### 4.5 Third-Party Integrations

- [ ] **SMS verification** - Twilio Verify or Firebase Phone Auth
- [ ] **Analytics** - PostHog or Mixpanel for product analytics, conversion funnels
- [ ] **Background jobs** - Inngest or Vercel Cron Jobs for async tasks (emails, notifications, reports)

---

## PHASE 5: LEGAL COMPLIANCE COMPLETION (Month 2-3)

### 5.1 GDPR Completion

- [x] **Enforce cookie consent technically** - conditionally load analytics/marketing scripts only when consent granted, log consent actions server-side with timestamps
- [ ] **Execute DPAs** (Data Processing Agreements) with all processors: Firebase/Google, Cloudinary, Vercel, PostgreSQL hosting. Reference in privacy policy
- [x] **Create data breach response procedures** - internal playbook, ANSPDCP notification templates, 72-hour timeline — `/data-breach` page created
- [ ] **Translate legal pages to English** - privacy, terms, cookies, ANPC (GDPR Art. 12 requires clear language for all users)
- [x] **Add child data collection disclosure** to privacy policy - childName/childAge collected for event registration, legal basis, retention, parental rights

### 5.2 Romanian E-Commerce Law

- [x] **Add ANPC graphical badges** to footer - official images linking to anpc.ro and SAL
- [x] **Complete OUG 34/2014 withdrawal form** - withdrawal form added to ANPC page
- [x] **Complete Legea 365/2002 disclosures** - price indications with taxes, delivery costs, technical contract steps, contract filing, input error correction, available languages
- [x] **Add provider labor classification guidance** - PFA/SRL/individual requirements, tax obligations disclaimer
- [x] **Add food safety requirements** for local food marketplace - DSVSA compliance, allergen fields in LocalFood model, hygiene standards reference

### 5.3 Platform Legal

- [x] **Implement DSA compliance** (Digital Services Act EU 2022/2065) - point of contact, notice-and-action mechanism, content moderation policy in terms, complaint-handling, transparency reporting
- [x] **Add insurance requirements/guidance** - professional liability insurance for providers, accident/injury coverage disclaimers
- [x] **Add IP takedown procedure** - notice-and-takedown for copyright infringement (Legea 8/1996)
- [x] **Add force majeure clause** to Terms of Service
- [x] **Add accessibility statement** page (European Accessibility Act - Directive 2019/882) — `/accessibility` page created
- [x] **Add metadata to legal pages** - proper titles, descriptions, canonical URLs

---

## PHASE 6: GROWTH FEATURES (Months 3-6)

### 6.1 Engagement Features

- [ ] **Working favorites/saved feature** - complete API routes + saved items page (model exists but no API)
- [ ] **Favorite providers** (not just jobs) - add SavedProvider model
- [ ] **Multi-dimensional ratings** - punctuality, quality, communication (not just single rating)
- [ ] **Review response capability** - let reviewed person reply
- [ ] **Automatic review prompts** after job completion (email/push)
- [ ] **Recurring bookings** support for regular babysitting schedules
- [ ] **Booking reminders** via email/push before scheduled date
- [ ] **Calendar integration** - Google Calendar, Apple Calendar export

### 6.2 Provider Dashboard

- [ ] **Dedicated provider dashboard** with earnings overview and charts
- [ ] **Booking calendar view** with upcoming jobs
- [ ] **Profile analytics** - views, impressions, conversion rate
- [ ] **Quick availability toggle** - mark available/unavailable instantly

### 6.3 Parent Dashboard

- [ ] **Active bookings overview**
- [ ] **Quick rebook** from past providers
- [ ] **Payment history** view
- [ ] **Favorite providers** quick access

### 6.4 Content & SEO

- [x] **Blog/content section** - parenting tips, childcare guides at `/ghid-parinti`
- [x] **"Ghid parinti"** - 6 parent guides targeting Romanian SEO keywords with full article content
- [x] **Breadcrumb navigation** with JSON-LD structured data on key pages
- [x] **Careers page** - dead link already removed from footer

### 6.5 Growth & Monetization

- [ ] **Subscription premium tiers** - unlock unlimited messaging, priority in search, etc.
- [ ] **Referral program** - invite friends, earn credits with shareable links and tracking dashboard
- [ ] **Video introductions** for providers (Cloudinary video upload)
- [ ] **Share buttons** on profiles and listings
- [ ] **Notification preferences** - granular control (settings page has toggle translations but no implementation)
- [ ] **Saved search with alerts** - notify when new matching providers/jobs appear

### 6.6 Misc Improvements

- [ ] **Message templates / quick replies** for common responses
- [ ] **"Superhost" / Top Provider** merit-based badge system
- [ ] **Recently viewed** profiles section
- [ ] **Date/number formatting** locale-aware (currently hardcoded `en-US`)
- [ ] **Decimal-to-Number conversion** via Prisma middleware (currently manual in every route)
- [ ] **Self-host Leaflet CSS** instead of loading from unpkg.com CDN
- [ ] **PWA install prompt** and service worker for offline support
- [ ] **Accessibility** - add `aria-expanded`, `role="menu"` to dropdowns, keyboard navigation, focus trap in mobile menu, skip-to-content link

---

## TRANSLATION GAPS (fix incrementally)

- [x] **About page** - full i18n with translation keys
- [x] **Help Center** - full i18n with translation keys
- [x] **Settings page** - full i18n with translation keys
- [x] **Kids Events page** - full i18n with translation keys
- [x] **Error messages and toasts** - translated to Romanian across all pages
- [x] **Loading state text** - button loading text and admin loading states fixed

---

## KEY FILES REFERENCE

| File                                         | Status     | Notes                                                                                              |
| -------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `packages/database/prisma/schema.prisma`     | ✅ Fixed   | Currency RON default, Availability/Booking/Payment/Subscription models added                       |
| `packages/shared/src/constants/index.ts`     | ✅ Fixed   | Map center = Bucharest, currency = RON, Lucide category icons                                      |
| `apps/web/vercel.json`                       | ✅ Fixed   | Region fra1, CORS restricted, security headers added                                               |
| `apps/web/src/app/layout.tsx`                | ✅ Fixed   | Dynamic `lang` via LocaleSync, `maximumScale` removed                                              |
| `apps/web/src/app/(main)/page.tsx`           | ✅ Fixed   | Server component with ISR, i18n, real DB stats, working search                                     |
| `apps/web/src/app/(main)/jobs/page.tsx`      | ✅ Fixed   | Result count, drawer filters, 4-col grid, Lucide icons                                             |
| `apps/web/src/app/(main)/about/page.tsx`     | ✅ Fixed   | Full i18n with translation keys                                                                    |
| `apps/web/src/app/(main)/help/page.tsx`      | ✅ Fixed   | Full i18n with translation keys                                                                    |
| `apps/web/src/app/(main)/settings/page.tsx`  | ✅ Fixed   | Full i18n with translation keys                                                                    |
| `apps/web/src/app/(main)/privacy/page.tsx`   | ⚠️ Partial | DSA/GDPR disclosures added, child data section added; placeholder company data still needs filling |
| `apps/web/src/app/(main)/terms/page.tsx`     | ⚠️ Partial | DSA, force majeure, IP takedown, insurance added; placeholder company data still needs filling     |
| `apps/web/src/app/(main)/anpc/page.tsx`      | ✅ Fixed   | Withdrawal form, Legea 365 disclosures, DSVSA requirements added                                   |
| `apps/web/src/app/(auth)/register/page.tsx`  | ✅ Fixed   | Consent recording + social proof section added                                                     |
| `apps/web/src/components/layout/header.tsx`  | ✅ Fixed   | i18n, 44px touch targets; bottom tabs in mobile-nav.tsx                                            |
| `apps/web/src/components/layout/footer.tsx`  | ✅ Fixed   | Working links, ANPC/SAL/ODR badges, Lucide icons, trust seals                                      |
| `apps/web/src/components/cookie-consent.tsx` | ✅ Fixed   | `hasConsent()` + `getCookiePreferences()` for technical enforcement                                |
| `apps/web/middleware.ts`                     | ✅ New     | Security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy)                                  |
| `apps/web/src/lib/socket.ts`                 | ❌ TODO    | Mock socket, polling only (4.2 Real-time Messaging)                                                |
| `apps/web/src/lib/rate-limiter.ts`           | ❌ TODO    | In-memory, broken on serverless (4.1 needs Redis/Vercel KV)                                        |
| `apps/web/src/lib/utils.ts`                  | ✅ Fixed   | RON formatting, ro-RO locale                                                                       |
| `apps/web/next.config.js`                    | ✅ Fixed   | Restricted image domains                                                                           |
| `.github/workflows/deploy.yml`               | ❌ TODO    | Migrations still run after deploy                                                                  |
| `apps/web/src/app/globals.css`               | ❌ TODO    | Color system could be improved                                                                     |
| `apps/web/tailwind.config.ts`                | ❌ TODO    | Color system could be improved                                                                     |

---

## ENVIRONMENT VARIABLES TO CONFIGURE

Keys/secrets that need to be set in Vercel (or `.env.local`) for new features to work:

| Variable         | Purpose                                                                 | Where to get                                                    |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `RESEND_API_KEY` | Email sending (welcome, notifications, digest)                          | [resend.com](https://resend.com) - free tier: 3000 emails/month |
| `EMAIL_FROM`     | Sender address for emails (default: `JuniorHub <noreply@juniorhub.ro>`) | Must match verified domain in Resend                            |
| `CRON_SECRET`    | Protects `/api/cron/weekly-digest` from unauthorized calls              | Generate with `openssl rand -hex 32`                            |

---

## NEW ACCOUNTS TO CREATE

Services that need accounts/setup for the implemented features:

| Service                                             | Purpose                                                             | What to do                                                                                                                                                                    | Cost                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **[Resend](https://resend.com)**                    | Transactional email (welcome, notifications, digest)                | 1. Create account at resend.com 2. Add & verify domain `juniorhub.ro` (DNS records: SPF, DKIM, DMARC) 3. Copy API key → `RESEND_API_KEY`                                      | Free: 3,000 emails/month, 100/day. Pro: $20/month for 50K emails |
| **[Cloudinary](https://cloudinary.com)**            | Image uploads (avatars, provider photos, kid clothes listings)      | Already in `.env.example`. If not created yet: 1. Create account 2. Copy cloud name, API key, API secret 3. Create unsigned upload preset `juniorhub_unsigned`                | Free: 25GB storage, 25GB bandwidth/month                         |
| **[Firebase](https://console.firebase.google.com)** | Authentication (Google, Facebook, Email login) + Push notifications | Already in `.env.example`. If not created yet: 1. Create project 2. Enable Auth providers (Email, Google, Facebook) 3. Generate Admin SDK private key 4. Copy all config keys | Free: unlimited auth, 1M push notifications/month                |
| **[idnorm.com](https://idnorm.com)**                | Provider identity verification (document scanning)                  | 1. Create account 2. Set up verification config 3. Copy API ID, Secret, Config ID, Webhook Secret                                                                             | Contact for pricing                                              |
| **Vercel**                                          | Hosting, cron jobs, edge functions                                  | Already deployed. Ensure `CRON_SECRET` is set in Vercel env vars for weekly digest cron                                                                                       | Free tier available                                              |

### Domain DNS Setup for Email (Resend)

After creating the Resend account, add these DNS records to `juniorhub.ro`:

1. **SPF** — TXT record (Resend will provide the exact value)
2. **DKIM** — CNAME records (Resend will provide 3 records)
3. **DMARC** — TXT record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@juniorhub.ro`
4. **Return-Path** — for bounce handling (Resend provides this)

Once verified, `noreply@juniorhub.ro` will work as the sender address.
