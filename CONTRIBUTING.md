# Contributing to LocalServices

Welcome to the LocalServices project! This guide will help you get started as a contributor.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style](#code-style)
6. [Pull Request Process](#pull-request-process)

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool    | Version  | Installation                                                 |
| ------- | -------- | ------------------------------------------------------------ |
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) or use `nvm install 20`     |
| pnpm    | 9.x      | `npm install -g pnpm@9`                                      |
| Docker  | Latest   | [docker.com](https://www.docker.com/products/docker-desktop) |
| Git     | Latest   | [git-scm.com](https://git-scm.com)                           |

**For mobile development:**
| Tool | Purpose |
|------|---------|
| Xcode | iOS simulator (macOS only) |
| Android Studio | Android emulator |
| Expo Go | Quick testing on physical device |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd localservices

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see docs/secrets-and-credentials.md)

# 4. Start the database
docker-compose up -d

# 5. Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate:dev

# 6. Seed the database with test data
pnpm db:seed

# 7. Start development servers
pnpm dev
```

After running these commands:

- **Web app**: http://localhost:3000
- **Mobile app**: Expo DevTools will open in browser
- **Prisma Studio**: Run `pnpm db:studio` for database GUI

---

## Project Structure

```
localservices/
├── apps/
│   ├── web/                    # Next.js 14 PWA + API
│   │   ├── src/
│   │   │   ├── app/           # App Router pages & API routes
│   │   │   │   ├── (auth)/    # Authentication pages
│   │   │   │   ├── (main)/    # Main app pages
│   │   │   │   └── api/       # Backend API endpoints
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utilities (auth, prisma, etc.)
│   │   │   └── stores/        # Zustand state stores
│   │   └── public/            # Static assets
│   │
│   └── mobile/                 # React Native Expo app
│       ├── app/               # Expo Router screens
│       │   ├── (tabs)/        # Tab navigation screens
│       │   └── (auth)/        # Auth screens
│       ├── components/        # React Native components
│       ├── hooks/             # Custom hooks
│       └── stores/            # Zustand stores
│
├── packages/
│   ├── shared/                # Shared code across all apps
│   │   └── src/
│   │       ├── types/         # TypeScript type definitions
│   │       ├── validators/    # Zod validation schemas
│   │       ├── constants/     # Shared constants (colors, etc.)
│   │       ├── i18n/          # Internationalization (EN, RO)
│   │       └── utils/         # Utility functions
│   │
│   └── database/              # Database package
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   ├── migrations/    # Migration history
│       │   └── seed.ts        # Seed data script
│       └── src/
│           └── client.ts      # Prisma client export
│
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD pipelines
├── docker-compose.yml         # Local development services
└── turbo.json                 # Turborepo configuration
```

---

## Development Workflow

### Starting Development

```bash
# Start everything
pnpm dev

# Or start specific apps
pnpm dev:web      # Web only (http://localhost:3000)
pnpm dev:mobile   # Mobile only (Expo DevTools)
```

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage report
```

### Code Quality

```bash
pnpm lint             # Check for lint errors
pnpm lint:fix         # Auto-fix lint errors
pnpm typecheck        # TypeScript validation
pnpm format           # Format with Prettier
```

### Database Operations

```bash
pnpm db:studio        # Open Prisma Studio (GUI)
pnpm db:migrate:dev   # Create/apply migrations
pnpm db:seed          # Seed test data
pnpm db:reset         # Reset database (WARNING: deletes data)
```

### Building for Production

```bash
pnpm build            # Build all apps
pnpm build:web        # Build web only
```

---

## Code Style

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve authentication token refresh issue
docs: update API documentation
test: add unit tests for job service
chore: update dependencies
refactor: simplify offer acceptance logic
```

### Branch Naming

```
feature/job-creation-form
fix/auth-token-refresh
chore/update-dependencies
docs/api-documentation
```

### TypeScript Guidelines

- Strict mode is enabled - no `any` types allowed
- Use interfaces for object shapes
- Use Zod for runtime validation
- Export types from `@localservices/shared`

### File Naming

- Components: `kebab-case.tsx` (e.g., `job-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `kebab-case.ts` (e.g., `user-types.ts`)

---

## Pull Request Process

### Before Submitting

1. **Create a feature branch** from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes**:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Commit with conventional commit messages**

5. **Push and create PR**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

### PR Requirements

- [ ] All tests pass
- [ ] Lint and typecheck pass
- [ ] PR description explains the changes
- [ ] Screenshots included for UI changes
- [ ] Documentation updated if needed

### Review Process

1. Create PR against `develop` branch
2. Request review from team members
3. Address feedback and update PR
4. Once approved, squash and merge

---

## Getting Help

- Check existing documentation in `/docs`
- Search existing issues and PRs
- Ask in team chat/discussions
- Create a new issue if needed

---

## Additional Resources

- [Getting Started Guide](docs/getting-started.md) - Detailed setup instructions
- [Architecture Overview](docs/architecture.md) - System design documentation
- [Extending the App](docs/extending-the-app.md) - How to add new features
- [Secrets Setup](docs/secrets-and-credentials.md) - Environment configuration
- [Coding Standards](docs/coding-standards.md) - Detailed code conventions
