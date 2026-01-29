# LocalServices

A marketplace platform connecting users with local service providers - babysitters, house cleaners, and food vendors.

## Features

- **Job Posting** - Post requests for babysitting, house cleaning, or local food
- **Service Offers** - Providers can submit offers with pricing and details
- **In-App Chat** - Real-time messaging between users and providers
- **Reviews & Ratings** - Rate and review completed jobs
- **User Profiles** - Detailed profiles with photos, location, and verification
- **Social Login** - Sign in with Google, Facebook, or email

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo |
| Web | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase) |
| Auth | Firebase Authentication |
| Storage | Cloudinary |
| Real-time | Socket.io |

## Project Structure

```
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── web/             # Next.js PWA + API
├── packages/
│   ├── shared/          # Shared types & utilities
│   ├── database/        # Prisma schema & client
│   └── ui/              # Shared UI components
└── docs/                # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local database)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/localservices.git
cd localservices

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Start local database
docker-compose up -d postgres

# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed

# Start development servers
pnpm dev
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/localservices"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
FIREBASE_ADMIN_PRIVATE_KEY=""

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm dev:web` | Start web app only |
| `pnpm dev:mobile` | Start mobile app only |
| `pnpm build` | Build all applications |
| `pnpm test` | Run test suite |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Documentation

### For New Developers

- [Getting Started](docs/getting-started.md) - Complete setup guide with prerequisites
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Coding Standards](docs/coding-standards.md) - Code conventions and best practices
- [Secrets & Credentials](docs/secrets-and-credentials.md) - How to obtain and configure all credentials

### Technical Documentation

- [Architecture Overview](docs/architecture.md) - System design and data flow
- [Extending the App](docs/extending-the-app.md) - How to add new features
- [API Documentation](docs/api.md) - REST API reference
- [Database Schema](docs/database.md) - Entity relationships

### Project Plans

- [Phase 1 Plan](docs/phase-1-plan.md) - MVP with free tier services
- [Phase 2 Plan](docs/phase-2-plan.md) - Monetization & AWS migration
- [Phase 3 Plan](docs/phase-3-plan.md) - Scale & advanced features

## Deployment

### Phase 1 (Free Tier)

- **Web**: Vercel
- **Database**: Supabase
- **Auth**: Firebase
- **Images**: Cloudinary

### Phase 2 (Production)

- **Infrastructure**: AWS (ECS, RDS, S3)
- **Payments**: Stripe

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'feat: add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary software. All rights reserved.
