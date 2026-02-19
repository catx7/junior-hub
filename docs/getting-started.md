# Getting Started Guide

This guide will walk you through setting up LocalServices for local development from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Project Setup](#project-setup)
4. [Database Setup](#database-setup)
5. [Running the Apps](#running-the-apps)
6. [Troubleshooting](#troubleshooting)

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

### For Mobile Development

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
# Using npm
npm install -g pnpm@9

# Verify installation
pnpm --version  # Should show 9.x.x
```

### 3. Install Docker

**macOS:**

```bash
# Download Docker Desktop from https://docker.com/products/docker-desktop
# Or use Homebrew:
brew install --cask docker
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
cd localservices
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for:

- Root workspace
- `apps/web` (Next.js)
- `apps/mobile` (Expo)
- `packages/shared`
- `packages/database`

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your credentials. See [Secrets and Credentials](secrets-and-credentials.md) for detailed instructions on obtaining each credential.

**Minimum required for local development:**

```env
# Database (uses Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/localservices?schema=public"

# Firebase Auth (create a project at console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
FIREBASE_ADMIN_CLIENT_EMAIL="your-client-email"

# Firebase Cloud Messaging (for push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"

# Google Gemini AI (for health chat & product scanner)
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Database Setup

### 1. Start Docker Containers

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

You should see:

```
NAME                    STATUS
localservices-postgres  running (0.0.0.0:5432->5432/tcp)
localservices-redis     running (0.0.0.0:6379->6379/tcp)
```

### 2. Generate Prisma Client

```bash
pnpm db:generate
```

### 3. Run Database Migrations

```bash
# For development (creates migrations)
pnpm db:migrate:dev

# For production (applies migrations)
pnpm db:migrate
```

### 4. Seed Test Data (Optional)

```bash
pnpm db:seed
```

This creates sample users, jobs, offers, and reviews.

### 5. View Database (Optional)

```bash
pnpm db:studio
```

Opens Prisma Studio at http://localhost:5555

---

## Running the Apps

### Start All Apps

```bash
pnpm dev
```

This starts:

- **Web app**: http://localhost:3000
- **Mobile app**: Expo DevTools opens in browser

### Start Individual Apps

```bash
# Web only
pnpm dev:web

# Mobile only
pnpm dev:mobile
```

### Mobile Development Options

**Option 1: Expo Go (Easiest)**

1. Install Expo Go on your phone
2. Scan QR code from terminal
3. App loads on your device

**Option 2: iOS Simulator (macOS)**

1. Open Xcode and install simulators
2. Press `i` in Expo terminal
3. Simulator launches with app

**Option 3: Android Emulator**

1. Open Android Studio > Device Manager
2. Create/start a virtual device
3. Press `a` in Expo terminal
4. App loads in emulator

---

## Troubleshooting

### Common Issues

#### "pnpm: command not found"

```bash
# Reinstall pnpm
npm install -g pnpm@9
# Restart terminal
```

#### "Docker daemon not running"

```bash
# macOS/Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

#### "Port 5432 already in use"

```bash
# Find what's using the port
lsof -i :5432

# Stop the conflicting service or change port in docker-compose.yml
```

#### "Prisma client not generated"

```bash
pnpm db:generate
```

#### "Migration failed"

```bash
# Reset database (WARNING: deletes all data)
pnpm db:reset
```

#### "Firebase credentials invalid"

- Verify you copied the credentials correctly
- Check that the Firebase project exists
- Ensure Authentication is enabled in Firebase Console

#### "Module not found" errors

```bash
# Clear caches and reinstall
pnpm clean
pnpm install
pnpm db:generate
```

### Getting Help

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Ask in team discussions
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## Setting Up Admin Access

### Quick Admin Setup

After creating your account, make yourself an admin:

```bash
# Option 1: Using Prisma Studio (Easiest)
pnpm db:studio
# Navigate to User model → Find your user → Change role to 'ADMIN'

# Option 2: Using SQL
psql $DATABASE_URL
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Verify Admin Access

1. Login to the web app
2. Navigate to `/admin`
3. You should see the admin dashboard

For complete admin features and capabilities, see [Admin Setup Guide](./admin-setup.md).

---

## New Features Overview

LocalServices includes powerful new features:

### 🏥 AI Health Chat (`/health-chat`)

- Ask pediatric health questions
- Powered by Google Gemini AI
- Professional medical context
- Conversation history

### 🔍 Product Scanner (`/product-scanner`)

- Scan product ingredients
- AI safety analysis
- Score: A, B, C, D
- E-additive detection
- Allergen warnings

### 🎉 Kids Events (`/kids-events`)

- Community events for children
- Art, sports, education activities
- Registration system
- Free and paid events

### 👕 Kids Clothes (`/kids-clothes`)

- Buy, sell, or donate clothes
- Sustainable marketplace
- Filter by size, gender, condition
- Support families in need

### 🛡️ Provider Verification (`/admin/verification`)

- Background check system
- Document verification
- Admin review process
- Verified provider badges

For detailed feature documentation, see [New Features Guide](./new-features.md).

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Create your account
3. ✅ Set yourself as admin
4. 📚 Read [Architecture Documentation](./architecture.md)
5. 📚 Review [API Documentation](./api.md)
6. 📚 Learn about [New Features](./new-features.md)
7. 🚀 Start building!

**Important Files:**

- [Admin Setup](./admin-setup.md) - Admin dashboard guide
- [New Features](./new-features.md) - AI features documentation
- [Coding Standards](./coding-standards.md) - Development guidelines
