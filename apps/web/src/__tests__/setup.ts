import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Prisma
vi.mock('@localservices/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    job: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    offer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    review: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    conversation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    conversationParticipant: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn({
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      job: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      offer: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      review: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      conversation: {
        create: vi.fn(),
      },
      notification: {
        create: vi.fn(),
        createMany: vi.fn(),
      },
    })),
  },
}));

// Mock Firebase Admin
vi.mock('@/lib/firebase-admin', () => ({
  verifyIdToken: vi.fn(),
  getUser: vi.fn(),
}));

// Mock auth middleware
vi.mock('@/lib/auth-middleware', () => ({
  authenticate: vi.fn(),
  verifyAuthToken: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }), { status: 401 })
  ),
  forbiddenResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: { code: 'FORBIDDEN' } }), { status: 403 })
  ),
  notFoundResponse: vi.fn((resource) =>
    new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: `${resource} not found` } }), { status: 404 })
  ),
  validationErrorResponse: vi.fn((errors) =>
    new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', details: errors } }), { status: 400 })
  ),
  serverErrorResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR' } }), { status: 500 })
  ),
}));
