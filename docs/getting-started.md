# Getting Started Guide

This guide walks you through setting up JuniorHub for local development and deploying to production.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Project Setup](#project-setup)
4. [Third-Party Accounts](#third-party-accounts)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Running the Apps](#running-the-apps)
8. [Admin Access](#admin-access)
9. [Deploying to Production](#deploying-to-production)
10. [Post-Deployment Checklist](#post-deployment-checklist)
11. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component  | Requirement                           |
| ---------- | ------------------------------------- |
| OS         | macOS 12+, Windows 10+, Ubuntu 20.04+ |
| RAM        | 8GB minimum, 16GB recommended         |
| Disk Space | 5GB free space                        |
| CPU        | Multi-core processor                  |

### Required Software

| Software | Version  | Purpose             |
| -------- | -------- | ------------------- |
| Node.js  | 20.x LTS | JavaScript runtime  |
| pnpm     | 9.x      | Package manager     |
| Docker   | Latest   | Database containers |
| Git      | Latest   | Version control     |

### For Mobile Development (Optional)

| Software       | Platform    | Purpose           |
| -------------- | ----------- | ----------------- |
| Xcode          | macOS       | iOS simulator     |
| Android Studio | All         | Android emulator  |
| Expo Go        | iOS/Android | Testing on device |

---

## Installing Prerequisites

### 1. Install Node.js

**Option A: Using nvm (Recommended)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
```

**Option B: Direct Download**

- Download from [nodejs.org](https://nodejs.org)
- Choose LTS version (20.x)

### 2. Install pnpm

```bash
npm install -g pnpm@9

# Verify
pnpm --version  # Should show 9.x.x
```

### 3. Install Docker

**macOS:**

```bash
brew install --cask docker
# Or download Docker Desktop from https://docker.com/products/docker-desktop
```

**Windows:**

- Download from [Docker Desktop for Windows](https://docker.com/products/docker-desktop)
- Enable WSL 2 when prompted

**Linux (Ubuntu):**

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in
```

### 4. Install Git

```bash
# macOS
brew install git

# Ubuntu
sudo apt-get install git

# Windows - download from git-scm.com
```

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd juniorhub
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo:

- `apps/web` — Next.js 14 web app (PWA + API routes)
- `apps/mobile` — React Native Expo app (iOS + Android)
- `packages/shared` — Shared types, validators, i18n, constants
- `packages/database` — Prisma schema and client

### 3. Important: NODE_ENV

If your shell has `NODE_ENV=production` set (check with `echo $NODE_ENV`), you must either:

- Remove it from your shell profile (`~/.zshrc` or `~/.bashrc`)
- Or prefix dev commands with `env -u NODE_ENV` (e.g., `env -u NODE_ENV pnpm dev:web`)

Next.js manages `NODE_ENV` automatically. Having it set to `production` in your shell breaks Tailwind CSS compilation and other dev tooling.

---

## Third-Party Accounts

You need these accounts before configuring environment variables. All have free tiers sufficient for development.

### Required for Local Development

| Service      | Purpose                                                       | Free Tier                     | Setup                                                              |
| ------------ | ------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| **Firebase** | Authentication (Google, Facebook, Email) + push notifications | Unlimited auth, 1M push/month | [console.firebase.google.com](https://console.firebase.google.com) |

### Required for Full Functionality

| Service        | Purpose                                                     | Free Tier                          | Setup                                    |
| -------------- | ----------------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| **Cloudinary** | Image uploads (avatars, job photos, listings)               | 25GB storage, 25GB bandwidth/month | [cloudinary.com](https://cloudinary.com) |
| **Resend**     | Transactional email (welcome, notifications, weekly digest) | 3,000 emails/month, 100/day        | [resend.com](https://resend.com)         |

### Required for Production Deployment

| Service        | Purpose                               | Free Tier                     | Setup                                |
| -------------- | ------------------------------------- | ----------------------------- | ------------------------------------ |
| **Vercel**     | Web hosting & serverless functions    | Hobby plan free               | [vercel.com](https://vercel.com)     |
| **Supabase**   | Production PostgreSQL database        | 500MB, 2 projects             | [supabase.com](https://supabase.com) |
| **GitHub**     | Source code + CI/CD                   | Free for public/private repos | [github.com](https://github.com)     |
| **Expo / EAS** | Mobile app builds & store submissions | 30 builds/month               | [expo.dev](https://expo.dev)         |

### Firebase Setup (Step-by-Step)

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable: Email/Password, Google, Facebook
   - Add `localhost` to Authorized domains (should be there by default)
3. **Get client config:**
   - Project Settings > General > Your apps > Add web app
   - Copy the `firebaseConfig` values
4. **Get Admin SDK credentials:**
   - Project Settings > Service Accounts > Generate New Private Key
   - Save the JSON — you need `client_email` and `private_key`
5. **Get VAPID key (for push notifications):**
   - Project Settings > Cloud Messaging > Web Push certificates > Generate key pair

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings > Upload > Upload presets
3. Create a new preset named `juniorhub_unsigned` with mode **Unsigned**
4. Copy your Cloud Name, API Key, and API Secret from the Dashboard

### Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Copy your API key
3. (Production only) Add and verify your domain `juniorhub.ro` with DNS records

---

## Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

### Minimum for Local Dev (web app starts, auth works)

```env
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/juniorhub"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/juniorhub"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="JuniorHub"

# Firebase Auth (from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Firebase Admin (from downloaded service account JSON)
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Full Local Dev (all features)

Add these to the minimum config above:

```env
# Firebase Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."

# Cloudinary (image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_UPLOAD_PRESET="juniorhub_unsigned"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="JuniorHub <noreply@juniorhub.ro>"

# Cron Jobs (generate with: openssl rand -hex 32)
CRON_SECRET="your-random-secret"

# Redis (Docker)
REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL="debug"
```

### Optional Services

```env
# Stripe (payments - Phase 2)
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Sentry (error tracking)
# SENTRY_DSN=""

# Google AdSense
# NEXT_PUBLIC_GOOGLE_ADSENSE_ID=""

# Identity Verification (idnorm.com)
# IDNORM_API_URL="https://api.idnorm.com"
# IDNORM_API_ID=""
# IDNORM_API_SECRET=""
```

---

## Database Setup

### 1. Start Docker Containers

```bash
docker-compose up -d

# Verify containers are running
docker-compose ps
```

You should see:

```
NAME              STATUS
juniorhub-db      running (0.0.0.0:5432->5432/tcp)
juniorhub-redis   running (0.0.0.0:6379->6379/tcp)
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

> **Note:** If you get Prisma version conflicts, use the local binary:
> `packages/database/node_modules/.bin/prisma generate --schema=packages/database/prisma/schema.prisma`

### 3. Run Database Migrations

```bash
pnpm db:migrate:dev
```

### 4. Seed Test Data (Optional)

```bash
pnpm db:seed
```

Creates sample users, jobs, offers, reviews, and events.

### 5. View Database (Optional)

```bash
pnpm db:studio
```

Opens Prisma Studio at http://localhost:5555

---

## Running the Apps

### Start Web App

```bash
pnpm dev:web
```

Opens at http://localhost:3000

### Start All Apps (Web + Mobile)

```bash
pnpm dev
```

### Start Mobile Only

```bash
pnpm dev:mobile
```

### Mobile Development Options

**Expo Go (Easiest):** Install Expo Go on your phone, scan QR code from terminal.

**iOS Simulator (macOS):** Open Xcode, install simulators, press `i` in Expo terminal.

**Android Emulator:** Open Android Studio > Device Manager, start a device, press `a` in Expo terminal.

### Useful Commands

```bash
pnpm build            # Build all packages
pnpm build:web        # Build web app only
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript validation
pnpm test             # Run all tests
```

---

## Admin Access

After creating your account through the web app:

```bash
# Option 1: Prisma Studio (easiest)
pnpm db:studio
# Navigate to User model > Find your user > Change role to 'ADMIN'

# Option 2: SQL
psql $DATABASE_URL
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then navigate to `/admin` to access the admin dashboard (user management, job moderation, verification, push notifications).

---

## Deploying to Production

### Step 1: Set Up Supabase (Production Database)

1. Create a project at [supabase.com](https://supabase.com), choose `eu-central-1` (Europe)
2. Get connection strings from Settings > Database > Connection string:
   - **Transaction mode (port 6543)** → `DATABASE_URL` (append `?pgbouncer=true`)
   - **Session mode (port 5432)** → `DIRECT_URL` (for migrations)

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Link project (set Root Directory to apps/web)
vercel link

# First deploy
vercel --prod
```

### Step 3: Configure Vercel Environment Variables

Go to Vercel project > Settings > Environment Variables and add **all** variables from the "Full Local Dev" section above, replacing:

| Variable              | Production Value                                          |
| --------------------- | --------------------------------------------------------- |
| `DATABASE_URL`        | Supabase pooled connection (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL`          | Supabase direct connection (port 5432)                    |
| `NEXT_PUBLIC_APP_URL` | `https://juniorhub.ro` (or your Vercel URL)               |
| `LOG_LEVEL`           | `info`                                                    |

> **Important:** `FIREBASE_ADMIN_PRIVATE_KEY` must include literal `\n` characters in the key.

### Step 4: Run Migrations Against Production

```bash
DATABASE_URL="your-supabase-direct-url" pnpm db:migrate
```

### Step 5: Set Up CI/CD (GitHub Actions)

The project has two workflows:

- `.github/workflows/ci.yml` — lint, typecheck, test, build on PRs
- `.github/workflows/deploy.yml` — auto-deploy to Vercel on push to `main`

Add these **GitHub Secrets** (repo > Settings > Secrets):

| Secret                             | Source                                  |
| ---------------------------------- | --------------------------------------- |
| `VERCEL_TOKEN`                     | Vercel > Settings > Tokens              |
| `VERCEL_ORG_ID`                    | From `.vercel/project.json`             |
| `VERCEL_PROJECT_ID`                | From `.vercel/project.json`             |
| `DATABASE_URL`                     | Supabase direct connection string       |
| `EXPO_TOKEN`                       | Expo > Account Settings > Access Tokens |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Same as Vercel                          |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as Vercel                          |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Same as Vercel                          |

### Step 6: Custom Domain

1. Vercel project > Settings > Domains > Add `juniorhub.ro`
2. Update DNS: `A` record → `76.76.21.21`, `CNAME` www → `cname.vercel-dns.com`
3. Add domain to Firebase > Authentication > Authorized domains
4. Update `NEXT_PUBLIC_APP_URL` on Vercel

### Step 7: Email Domain Verification (Resend)

Add these DNS records for `juniorhub.ro` (Resend provides exact values):

1. **SPF** — TXT record
2. **DKIM** — 3 CNAME records
3. **DMARC** — TXT: `v=DMARC1; p=quarantine; rua=mailto:dmarc@juniorhub.ro`
4. **Return-Path** — for bounce handling

### Step 8: Mobile Deployment (Optional)

```bash
npm install -g eas-cli
eas login
cd apps/mobile

# Preview build (internal testing)
eas build --platform all --profile preview

# Production build + submit to stores
eas build --platform all --profile production --auto-submit
```

Set EAS environment variables at [expo.dev](https://expo.dev) > Project > Settings:

| Variable                           | Value                  |
| ---------------------------------- | ---------------------- |
| `EXPO_PUBLIC_API_URL`              | `https://juniorhub.ro` |
| `EXPO_PUBLIC_FIREBASE_API_KEY`     | Same as web            |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as web            |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`  | Same as web            |

---

## Post-Deployment Checklist

### Functionality

- [ ] Website loads at production URL
- [ ] Register + login works (Email, Google, Facebook)
- [ ] Jobs load on browse page (database connected)
- [ ] Image upload works (Cloudinary)
- [ ] Create a job, make an offer, send a message
- [ ] Push notifications deliver
- [ ] Admin panel accessible at `/admin`
- [ ] Health check returns OK: `GET /api/health`

### Security & Legal

- [ ] HTTPS working with valid certificate
- [ ] Security headers present (check at securityheaders.com)
- [ ] Cookie consent banner appears for new visitors
- [ ] Privacy policy, terms, ANPC pages accessible
- [ ] GDPR data export (`/api/users/me/export`) and deletion (`/api/users/me/delete`) work
- [ ] Fill in placeholder company data in `/privacy`, `/terms`, `/anpc` pages: `[CUI]`, `[Adresa completa]`, `[Numar telefon]`, `[J__/____/____]`

### SEO

- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] `sitemap.xml` accessible at `/sitemap.xml`
- [ ] JSON-LD structured data on homepage, job pages, event pages
- [ ] Open Graph meta tags render correctly (test with Facebook Sharing Debugger)

### Admin Setup

```sql
-- In Supabase SQL Editor
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Troubleshooting

### "pnpm: command not found"

```bash
npm install -g pnpm@9
# Restart terminal
```

### "Docker daemon not running"

```bash
# macOS/Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

### "Port 5432 already in use"

```bash
lsof -i :5432
# Stop the conflicting service or change port in docker-compose.yml
```

### "@tailwind base" parse error

Your shell likely has `NODE_ENV=production`. Remove it or use `env -u NODE_ENV pnpm dev:web`.

### Prisma client not generated / version mismatch

```bash
# Use the local Prisma binary (avoids version conflicts)
packages/database/node_modules/.bin/prisma generate --schema=packages/database/prisma/schema.prisma
```

### "Migration failed"

```bash
# Reset database (WARNING: deletes all data)
pnpm db:reset
```

### Firebase Auth not working in production

- Add your production domain to Firebase > Authentication > Authorized domains
- Verify `FIREBASE_ADMIN_PRIVATE_KEY` includes literal `\n` characters

### Build fails on Vercel

- Check all `NEXT_PUBLIC_*` env vars are set (they're needed at build time)
- Verify `DATABASE_URL` and `DIRECT_URL` are set
- Check build logs: Vercel Dashboard > Deployments > click failed deploy

### "Module not found" errors

```bash
pnpm clean
pnpm install
pnpm db:generate
```

### Getting Help

1. Check this troubleshooting section
2. Search existing GitHub issues
3. Ask in team discussions
4. Create a new issue with: error message, steps to reproduce, environment info (OS, Node version)

---

## Architecture Overview

| Directory                  | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `apps/web/src/app/`        | Next.js App Router pages and API routes             |
| `apps/web/src/components/` | React components (ui/, layout/)                     |
| `apps/web/src/hooks/`      | Custom React hooks                                  |
| `apps/web/src/lib/`        | Utilities, auth middleware, API helpers             |
| `apps/mobile/`             | React Native Expo app                               |
| `packages/shared/`         | Types, Zod validators, i18n translations, constants |
| `packages/database/`       | Prisma schema and client                            |

### Key Features

| Feature               | Route                       | Description                      |
| --------------------- | --------------------------- | -------------------------------- |
| Jobs                  | `/jobs`                     | Service requests marketplace     |
| Providers             | `/providers`, `/babysitter` | Browse verified providers        |
| Kids Events           | `/kids-events`              | Community events for children    |
| Kids Clothes          | `/kids-clothes`             | Buy, sell, donate marketplace    |
| Local Food            | `/local-food`               | Homemade food marketplace        |
| Parent Guides         | `/ghid-parinti`             | SEO content for parents          |
| Admin                 | `/admin`                    | User/job/verification management |
| Provider Verification | `/admin/verification`       | Background check review          |

### Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, ISR)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Firebase Authentication
- **State:** Zustand + React Query
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Email:** Resend
- **Images:** Cloudinary
- **Hosting:** Vercel (web), EAS (mobile)
- **Region:** `fra1` (Frankfurt) — configured in `vercel.json`

---

## Further Reading

- [Deployment Guide](./deployment.md) — Detailed Vercel/Supabase/EAS setup
- [Secrets and Credentials](./secrets-and-credentials.md) — How to obtain each credential
- [Architecture](./architecture.md) — Detailed system design
- [API Documentation](./api.md) — API route reference
- [Admin Setup](./admin-setup.md) — Admin dashboard guide
- [Coding Standards](./coding-standards.md) — Development guidelines
