# Deployment Guide: Local to Production

This guide walks you through deploying JuniorHub from a local development environment to production.

---

## Table of Contents

1. [Prerequisites & Accounts](#1-prerequisites--accounts)
2. [Production Database (Supabase)](#2-production-database-supabase)
3. [Web Deployment (Vercel)](#3-web-deployment-vercel)
4. [Configure Environment Variables on Vercel](#4-configure-environment-variables-on-vercel)
5. [Run Database Migrations](#5-run-database-migrations)
6. [CI/CD with GitHub Actions](#6-cicd-with-github-actions)
7. [Mobile Deployment (EAS / Expo)](#7-mobile-deployment-eas--expo)
8. [Custom Domain](#8-custom-domain)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites & Accounts

You'll need accounts on these services (all have free tiers):

| Service        | Purpose                                  | Sign up                             |
| -------------- | ---------------------------------------- | ----------------------------------- |
| **Vercel**     | Web hosting & serverless functions       | https://vercel.com                  |
| **Supabase**   | PostgreSQL database                      | https://supabase.com                |
| **Firebase**   | Authentication (Google, Facebook, Email) | https://console.firebase.google.com |
| **Cloudinary** | Image uploads & CDN                      | https://cloudinary.com              |
| **Expo / EAS** | Mobile app builds & submissions          | https://expo.dev                    |
| **GitHub**     | Source code & CI/CD                      | https://github.com                  |

Optional:

- **Google Cloud Console** — for Google Maps API key
- **Sentry** — error tracking
- **Upstash** — serverless Redis (rate limiting)

---

## 2. Production Database (Supabase)

### 2A. Create a Supabase project

1. Go to https://supabase.com and create a new project
2. Choose a region close to your users (e.g., `eu-central-1` for Europe)
3. Set a strong database password — save it somewhere safe

### 2B. Get your connection strings

In your Supabase dashboard go to **Settings → Database → Connection string**:

- **Transaction mode (port 6543)** — use this as `DATABASE_URL` (for the app at runtime, supports connection pooling)

  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

- **Session mode (port 5432)** — use this as `DIRECT_URL` (for Prisma migrations)
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
  ```

> **Important:** Prisma needs `DIRECT_URL` for migrations (direct connection) and `DATABASE_URL` for runtime queries (pooled connection). This is already configured in the Prisma schema.

---

## 3. Web Deployment (Vercel)

### 3A. Install Vercel CLI

```bash
npm install -g vercel
```

### 3B. Link your project

```bashver
# From the project root
vercel link
```

Follow the prompts to:

- Log in to your Vercel account
- Link to an existing project or create a new one
- **Set the Root Directory to `apps/web`** (this lets Vercel detect Next.js)

Then go to your Vercel project → **Settings → General → Root Directory** and confirm it's set to `apps/web`.

The project already has a `vercel.json` that handles the monorepo build configuration:

- Install command: `cd ../.. && pnpm install` (navigates to monorepo root)
- Build command: `cd ../.. && pnpm turbo build --filter=@localservices/web`
- Output directory: `.next`
- Region: `iad1` (US East — change in `vercel.json` if needed)

### 3C. Deploy manually (first time)

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

After linking, note your **Vercel Org ID** and **Project ID** from `.vercel/project.json` — you'll need these for CI/CD.

---

## 4. Configure Environment Variables on Vercel

Go to your Vercel project → **Settings → Environment Variables** and add all of these for the **Production** environment:

### Database

| Variable       | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | Supabase pooled connection string (port 6543, with `?pgbouncer=true`) |
| `DIRECT_URL`   | Supabase direct connection string (port 5432)                         |

### Application

| Variable               | Value                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`             | `production`                                                                       |
| `NEXT_PUBLIC_APP_URL`  | Your production URL, e.g. `https://juniorhub.com` or `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `JuniorHub`                                                                        |

### Firebase Authentication (Client-side)

| Variable                                   | Value                                    |
| ------------------------------------------ | ---------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | From Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `your-project.firebaseapp.com`           |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Your Firebase project ID                 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `your-project.appspot.com`               |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console                    |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | From Firebase Console                    |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | From Firebase Console (optional)         |

### Firebase Admin SDK (Server-side)

| Variable                      | Value                                                            |
| ----------------------------- | ---------------------------------------------------------------- |
| `FIREBASE_ADMIN_PROJECT_ID`   | Same as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`                        |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | From Firebase service account JSON                               |
| `FIREBASE_ADMIN_PRIVATE_KEY`  | From Firebase service account JSON (include the `\n` characters) |

> **How to get Firebase Admin credentials:** Firebase Console → Project Settings → Service Accounts → Generate New Private Key. The downloaded JSON contains `client_email` and `private_key`.

### Cloudinary (Image Uploads)

| Variable                            | Value                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name                                                                          |
| `CLOUDINARY_API_KEY`                | From Cloudinary dashboard                                                                           |
| `CLOUDINARY_API_SECRET`             | From Cloudinary dashboard                                                                           |
| `CLOUDINARY_UPLOAD_PRESET`          | `juniorhub_unsigned` (create this in Cloudinary Settings → Upload → Upload presets as **unsigned**) |

### Google AdSense (Optional)

| Variable                        | Value                     |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | Your AdSense publisher ID |

---

## 5. Run Database Migrations

After setting up Supabase and configuring the `DATABASE_URL`, run migrations:

```bash
# Option A: Run locally against production database
DATABASE_URL="your-supabase-direct-url" pnpm db:migrate

# Option B: The CI/CD pipeline runs migrations automatically (see step 6)
```

To seed the production database with initial data (optional):

```bash
DATABASE_URL="your-supabase-direct-url" pnpm db:seed
```

> **Warning:** Only run seed on a fresh database. The seed script creates test users and sample data.

---

## 6. CI/CD with GitHub Actions

The project has two workflows already configured:

### CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and PR to `main`/`develop`:

1. Lint & Typecheck
2. Run tests
3. Build web
4. Build mobile (preview, only on `main`)

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on every push to `main`:

1. Deploy web to Vercel
2. Run database migrations
3. Deploy mobile (manual trigger only via `workflow_dispatch`)

### Required GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret                             | Where to get it                                             |
| ---------------------------------- | ----------------------------------------------------------- |
| `VERCEL_TOKEN`                     | Vercel → Settings → Tokens → Create                         |
| `VERCEL_ORG_ID`                    | From `.vercel/project.json` after running `vercel link`     |
| `VERCEL_PROJECT_ID`                | From `.vercel/project.json` after running `vercel link`     |
| `DATABASE_URL`                     | Your Supabase **direct** connection string (for migrations) |
| `EXPO_TOKEN`                       | Expo → Account Settings → Access Tokens → Create            |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Same as Vercel env var                                      |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as Vercel env var                                      |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Same as Vercel env var                                      |

### Required GitHub Variables

Go to **Settings → Secrets and variables → Actions → Variables**:

| Variable              | Value               |
| --------------------- | ------------------- |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

### How it works

1. Push code to `main`
2. CI runs lint, typecheck, tests, build
3. Deploy workflow builds and deploys to Vercel
4. Database migrations run automatically after web deploy
5. Mobile builds are triggered manually (Actions → Deploy → Run workflow)

---

## 7. Mobile Deployment (EAS / Expo)

### 7A. Initial setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# From the mobile app directory
cd apps/mobile
```

### 7B. Configure `eas.json`

The file is already configured at `apps/mobile/eas.json` with three profiles:

- **development** — Development client (APK for Android, internal for iOS)
- **preview** — Internal testing builds
- **production** — Store-ready builds (AAB for Android, IPA for iOS)

### 7C. Update submission config

Edit `apps/mobile/eas.json` to set your actual Apple/Google credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-actual-apple-id@email.com",
        "ascAppId": "your-actual-app-store-connect-app-id"
      },
      "android": {
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

For Android: upload your Google Play service account JSON key via `eas credentials`.

### 7D. Build and deploy

```bash
# Preview build (for internal testing)
eas build --platform all --profile preview

# Production build + auto-submit to stores
eas build --platform all --profile production --auto-submit

# Or build a single platform
eas build --platform ios --profile production --auto-submit
eas build --platform android --profile production --auto-submit
```

### 7E. Mobile environment variables

Set these in Expo/EAS project settings (https://expo.dev → your project → Settings → Environment Variables):

| Variable                           | Value                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL`              | Your production web URL (e.g. `https://juniorhub.com`) |
| `EXPO_PUBLIC_FIREBASE_API_KEY`     | Same as web                                            |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as web                                            |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`  | Same as web                                            |

---

## 8. Custom Domain

### Vercel

1. Go to Vercel project → **Settings → Domains**
2. Add your domain (e.g., `juniorhub.com`)
3. Update your domain's DNS records as instructed by Vercel:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`
4. Vercel provisions SSL automatically

### Firebase Auth

1. Go to Firebase Console → **Authentication → Settings → Authorized domains**
2. Add your production domain (e.g., `juniorhub.com`)
3. Update `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` if using a custom auth domain

### Update environment variable

After adding a custom domain, update `NEXT_PUBLIC_APP_URL` in Vercel to your new domain URL.

---

## 9. Post-Deployment Checklist

After deploying, verify everything works:

- [ ] **Website loads** — Visit your production URL
- [ ] **Auth works** — Register, login with email, Google, and Facebook
- [ ] **Database connected** — Jobs load on the browse page
- [ ] **Image uploads** — Post a job with photos (Cloudinary)
- [ ] **API routes** — Create a job, make an offer, send a message
- [ ] **Notifications** — Check push notification delivery
- [ ] **Admin panel** — Access `/admin` (after setting your user role to ADMIN)
- [ ] **Mobile app** — Install preview build and test API connection
- [ ] **SSL** — Verify HTTPS is working with valid certificate

### Make yourself admin

```sql
-- Connect to your Supabase database (SQL Editor in dashboard)
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or use Prisma Studio:

```bash
DATABASE_URL="your-supabase-connection-string" pnpm db:studio
```

---

## 10. Troubleshooting

### Build fails on Vercel

- Check that all `NEXT_PUBLIC_*` env vars are set (they're needed at build time)
- Verify `DATABASE_URL` and `DIRECT_URL` are set
- Check the build logs: Vercel Dashboard → Deployments → click the failed deploy

### Database connection errors

- Make sure you're using the **pooled** connection string (port 6543) for `DATABASE_URL`
- Make sure you're using the **direct** connection string (port 5432) for `DIRECT_URL`
- Append `?pgbouncer=true` to the pooled URL
- Check Supabase dashboard for connection limits

### Prisma migration fails

- Migrations need the **direct** connection (not pooled): `DIRECT_URL`
- Run locally if CI fails: `DATABASE_URL="direct-url" pnpm db:migrate`

### Firebase Auth not working in production

- Add your production domain to Firebase → Authentication → Authorized domains
- Verify all Firebase env vars are set correctly on Vercel
- The `FIREBASE_ADMIN_PRIVATE_KEY` must include literal `\n` newline characters

### Images not uploading

- Verify Cloudinary credentials on Vercel
- Make sure the upload preset `juniorhub_unsigned` exists and is set to **unsigned** in Cloudinary

### Mobile app can't connect to API

- Check `EXPO_PUBLIC_API_URL` points to your production URL
- Verify CORS headers are configured (already set in `vercel.json`)

---

## Quick Reference: All Commands

```bash
# First-time setup
npm install -g vercel eas-cli
vercel link
vercel --prod                          # First deploy

# Database
DATABASE_URL="..." pnpm db:migrate     # Run migrations against prod
DATABASE_URL="..." pnpm db:seed        # Seed prod (optional, fresh DB only)
DATABASE_URL="..." pnpm db:studio      # Browse prod data

# Web
vercel                                 # Preview deploy
vercel --prod                          # Production deploy

# Mobile
cd apps/mobile
eas build --platform all --profile preview           # Test build
eas build --platform all --profile production         # Store build
eas build --platform all --profile production --auto-submit  # Build + submit
```

After the initial setup, all deploys happen automatically via GitHub Actions when you push to `main`.
