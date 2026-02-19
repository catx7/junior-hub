# Secrets and Credentials Setup

This guide walks you through obtaining and configuring all required credentials for LocalServices.

## Table of Contents

1. [Overview](#overview)
2. [Local Development Credentials](#local-development-credentials)
3. [Firebase Setup](#firebase-setup)
4. [Database Setup](#database-setup)
5. [Cloudinary Setup](#cloudinary-setup)
6. [Vercel Setup](#vercel-setup)
7. [Expo/EAS Setup](#expoeas-setup)
8. [GitHub Secrets](#github-secrets)
9. [Environment Files Reference](#environment-files-reference)

---

## Overview

### Required Credentials by Environment

| Service       | Local Dev      | Staging  | Production       |
| ------------- | -------------- | -------- | ---------------- |
| PostgreSQL    | Docker (local) | Supabase | Supabase/AWS RDS |
| Firebase Auth | Required       | Required | Required         |
| Cloudinary    | Optional       | Required | Required         |
| Vercel        | Not needed     | Required | Required         |
| Expo/EAS      | Optional       | Required | Required         |

### Security Best Practices

- Never commit `.env.local` or any file with secrets
- Use different credentials for each environment
- Rotate secrets regularly
- Use minimal permissions for service accounts
- Store production secrets in CI/CD secrets manager

---

## Local Development Credentials

For local development, most services can use free tiers or local containers.

### Quick Start `.env.local`

```env
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/localservices?schema=public"

# Redis (Docker)
REDIS_URL="redis://localhost:6379"

# Firebase (see Firebase Setup section)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (for server-side)
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Cloudinary (optional for local)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## Firebase Setup

Firebase provides authentication and push notifications.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `localservices-dev` (or your name)
4. Enable/disable Google Analytics as desired
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in providers:

**Email/Password:**

1. Click "Email/Password"
2. Enable "Email/Password"
3. Click "Save"

**Google:**

1. Click "Google"
2. Enable it
3. Add support email
4. Click "Save"

**Facebook:**

1. Click "Facebook"
2. Enable it
3. Enter App ID and App Secret (from Facebook Developer Console)
4. Copy the OAuth redirect URI for Facebook setup
5. Click "Save"

### Step 3: Get Web App Credentials

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (</>) to add web app
4. Register app name: `localservices-web`
5. Copy the configuration values:

```javascript
const firebaseConfig = {
  apiKey: '...', // NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: '...', // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: '...', // NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: '...', // NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: '...', // NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: '...', // NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### Step 4: Get Admin SDK Credentials

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values:

```json
{
  "project_id": "...", // FIREBASE_ADMIN_PROJECT_ID
  "private_key": "...", // FIREBASE_ADMIN_PRIVATE_KEY
  "client_email": "..." // FIREBASE_ADMIN_CLIENT_EMAIL
}
```

**Important:** The private key contains `\n` characters. Keep them as-is in your `.env.local`:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

---

## Database Setup

### Local Development (Docker)

Docker Compose handles local PostgreSQL:

```bash
# Start database
docker-compose up -d

# Connection string is:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/localservices?schema=public"
```

### Supabase (Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Sign up and create a new project
3. Wait for project to initialize
4. Go to Settings > Database
5. Find "Connection string" > "URI"
6. Copy the connection string:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres"
```

**Note:** Replace `[YOUR-PASSWORD]` with your database password.

### Connection Pooling (Recommended for Production)

For serverless environments like Vercel, use connection pooling:

```env
# Direct connection (migrations)
DATABASE_URL="postgresql://..."

# Pooled connection (application)
DATABASE_URL_POOLED="postgresql://...?pgbouncer=true"
```

---

## Cloudinary Setup

Cloudinary handles image uploads and transformations.

### Step 1: Create Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Verify your email

### Step 2: Get Credentials

1. Go to Dashboard
2. Find your credentials:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxxxxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### Step 3: Configure Upload Preset (Optional)

1. Go to Settings > Upload
2. Click "Add upload preset"
3. Set preset name: `localservices`
4. Signing Mode: Unsigned (for client-side uploads)
5. Folder: `localservices/`
6. Save

---

## Vercel Setup

Vercel hosts the web application and API.

### Step 1: Create Account & Project

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Configure project settings

### Step 2: Get Credentials for CI/CD

1. Go to Account Settings > Tokens
2. Create new token: `github-actions`
3. Copy the token: `vercel_xxxxxxxxx`

```env
VERCEL_TOKEN="vercel_xxxxxxxxx"
```

4. Go to your project settings
5. Find Vercel Project ID and Org ID:

```env
VERCEL_PROJECT_ID="prj_xxxxxxxxx"
VERCEL_ORG_ID="team_xxxxxxxxx"
```

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings > Environment Variables
2. Add all production environment variables
3. Set appropriate environments (Production, Preview, Development)

---

## Expo/EAS Setup

EAS (Expo Application Services) handles mobile builds and submissions.

### Step 1: Create Expo Account

1. Go to [Expo](https://expo.dev)
2. Sign up for free account
3. Verify your email

### Step 2: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Step 3: Get Access Token

1. Go to [Expo Access Tokens](https://expo.dev/settings/access-tokens)
2. Create new token: `github-actions`
3. Copy the token:

```env
EXPO_TOKEN="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 4: Configure EAS Build

```bash
cd apps/mobile
eas build:configure
```

This creates `eas.json` with build profiles.

---

## GitHub Secrets

Add these secrets to your GitHub repository for CI/CD.

### Go to Repository Settings > Secrets

| Secret Name                        | Description             | Where to Get            |
| ---------------------------------- | ----------------------- | ----------------------- |
| `VERCEL_TOKEN`                     | Vercel deployment token | Vercel Account Settings |
| `VERCEL_ORG_ID`                    | Vercel organization ID  | Vercel Project Settings |
| `VERCEL_PROJECT_ID`                | Vercel project ID       | Vercel Project Settings |
| `EXPO_TOKEN`                       | Expo access token       | Expo Account Settings   |
| `DATABASE_URL`                     | Production database URL | Supabase Dashboard      |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Firebase web API key    | Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain    | Firebase Console        |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase project ID     | Firebase Console        |

### Adding Secrets

1. Go to repository Settings
2. Click "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Enter name and value
5. Click "Add secret"

---

## Environment Files Reference

### `.env.example` (Committed to Git)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/localservices?schema=public"
REDIS_URL="redis://localhost:6379"

# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# Firebase (Admin)
FIREBASE_ADMIN_PROJECT_ID=""
FIREBASE_ADMIN_PRIVATE_KEY=""
FIREBASE_ADMIN_CLIENT_EMAIL=""

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### `.env.local` (Local Development - NOT committed)

Copy from `.env.example` and fill in your credentials.

### Vercel Environment Variables (Production)

Add all variables from `.env.example` with production values.

---

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"

- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check Firebase project is active

### "Prisma: Can't reach database server"

- Verify `DATABASE_URL` is correct
- Check database is running (`docker-compose ps`)
- Verify network access (Supabase may need IP whitelisting)

### "Cloudinary: Invalid API credentials"

- Verify cloud name, API key, and secret
- Check for typos

### "Vercel: Unauthorized"

- Regenerate Vercel token
- Verify org and project IDs

### "EAS: Not authenticated"

- Run `eas login` again
- Regenerate Expo token
