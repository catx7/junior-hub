import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock modules before importing
vi.mock('@localservices/database');
vi.mock('@/lib/firebase-admin');

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration without Firebase token', async () => {
      const { POST } = await import('@/app/api/auth/register/route');

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject registration with invalid Firebase token', async () => {
      const { verifyIdToken } = await import('@/lib/firebase-admin');
      vi.mocked(verifyIdToken).mockRejectedValue(new Error('Invalid token'));

      const { POST } = await import('@/app/api/auth/register/route');

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject registration with invalid input data', async () => {
      const { verifyIdToken } = await import('@/lib/firebase-admin');
      vi.mocked(verifyIdToken).mockResolvedValue({ uid: 'firebase-uid-123' } as any);

      const { POST } = await import('@/app/api/auth/register/route');

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({ name: 'A', email: 'invalid-email' }), // Invalid data
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate user registration', async () => {
      const { verifyIdToken } = await import('@/lib/firebase-admin');
      const { prisma } = await import('@localservices/database');

      vi.mocked(verifyIdToken).mockResolvedValue({ uid: 'firebase-uid-123' } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'existing-user' } as any);

      const { POST } = await import('@/app/api/auth/register/route');

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });

    it('should successfully register new user with valid Firebase token', async () => {
      const { verifyIdToken } = await import('@/lib/firebase-admin');
      const { prisma } = await import('@localservices/database');

      vi.mocked(verifyIdToken).mockResolvedValue({ uid: 'firebase-uid-123' } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        role: 'USER',
        isVerified: false,
        createdAt: new Date(),
      } as any);

      const { POST } = await import('@/app/api/auth/register/route');

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-user-id');
      expect(data.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/social', () => {
    it('should reject request without ID token', async () => {
      const { POST } = await import('@/app/api/auth/social/route');

      const request = new NextRequest('http://localhost/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create new user for first-time social login', async () => {
      const { verifyIdToken, getUser } = await import('@/lib/firebase-admin');
      const { prisma } = await import('@localservices/database');

      vi.mocked(verifyIdToken).mockResolvedValue({ uid: 'firebase-uid-456' } as any);
      vi.mocked(getUser).mockResolvedValue({
        uid: 'firebase-uid-456',
        email: 'social@example.com',
        displayName: 'Social User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'new-social-user',
        email: 'social@example.com',
        name: 'Social User',
        avatar: 'https://example.com/photo.jpg',
        role: 'USER',
        isVerified: true,
      } as any);

      const { POST } = await import('@/app/api/auth/social/route');

      const request = new NextRequest('http://localhost/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', idToken: 'valid-id-token' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isNewUser).toBe(true);
      expect(data.user.email).toBe('social@example.com');
    });
  });
});
