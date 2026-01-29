import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@localservices/database');
vi.mock('@/lib/auth-middleware');

describe('Offers API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/jobs/[id]/offers', () => {
    it('should reject offer on own job', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'user-123', // Same as authenticated user
        status: 'OPEN',
      } as any);

      const { POST } = await import('@/app/api/jobs/[id]/offers/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 100, message: 'This is my offer message for this job' }),
      });

      const response = await POST(request, { params: { id: 'job-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('own job');
    });

    it('should reject offer on non-open job', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'provider-user',
        email: 'provider@example.com',
        name: 'Provider User',
        role: 'USER',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'poster-user',
        status: 'IN_PROGRESS', // Not OPEN
      } as any);

      const { POST } = await import('@/app/api/jobs/[id]/offers/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 100, message: 'This is my offer message for this job' }),
      });

      const response = await POST(request, { params: { id: 'job-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('not accepting offers');
    });

    it('should reject duplicate offer', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'provider-user',
        email: 'provider@example.com',
        name: 'Provider User',
        role: 'USER',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'poster-user',
        status: 'OPEN',
      } as any);

      vi.mocked(prisma.offer.findUnique).mockResolvedValue({
        id: 'existing-offer',
      } as any);

      const { POST } = await import('@/app/api/jobs/[id]/offers/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 100, message: 'This is my offer message for this job' }),
      });

      const response = await POST(request, { params: { id: 'job-123' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });
  });

  describe('PATCH /api/offers/[id]/accept', () => {
    it('should reject acceptance by non-poster', async () => {
      const { authenticate, forbiddenResponse } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'other-user',
        email: 'other@example.com',
        name: 'Other User',
        role: 'USER',
      });

      vi.mocked(prisma.offer.findUnique).mockResolvedValue({
        id: 'offer-123',
        providerId: 'provider-user',
        isAccepted: false,
        isRejected: false,
        job: {
          id: 'job-123',
          posterId: 'poster-user', // Different from authenticated user
          status: 'OPEN',
          title: 'Test Job',
        },
        provider: { id: 'provider-user', name: 'Provider' },
      } as any);

      const { PATCH } = await import('@/app/api/offers/[id]/accept/route');

      const request = new NextRequest('http://localhost/api/offers/offer-123/accept', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: { id: 'offer-123' } });
      expect(response.status).toBe(403);
    });

    it('should reject acceptance of already processed offer', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'poster-user',
        email: 'poster@example.com',
        name: 'Poster User',
        role: 'USER',
      });

      vi.mocked(prisma.offer.findUnique).mockResolvedValue({
        id: 'offer-123',
        providerId: 'provider-user',
        isAccepted: true, // Already accepted
        isRejected: false,
        job: {
          id: 'job-123',
          posterId: 'poster-user',
          status: 'IN_PROGRESS',
          title: 'Test Job',
        },
        provider: { id: 'provider-user', name: 'Provider' },
      } as any);

      const { PATCH } = await import('@/app/api/offers/[id]/accept/route');

      const request = new NextRequest('http://localhost/api/offers/offer-123/accept', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: { id: 'offer-123' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /api/offers/[id]', () => {
    it('should reject withdrawal by non-provider', async () => {
      const { verifyAuthToken } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(verifyAuthToken).mockResolvedValue({
        id: 'other-user',
        email: 'other@example.com',
        name: 'Other User',
        role: 'USER',
      });

      vi.mocked(prisma.offer.findUnique).mockResolvedValue({
        id: 'offer-123',
        providerId: 'provider-user', // Different from authenticated user
        isAccepted: false,
        job: { status: 'OPEN' },
      } as any);

      const { DELETE } = await import('@/app/api/offers/[id]/route');

      const request = new NextRequest('http://localhost/api/offers/offer-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'offer-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
    });

    it('should reject withdrawal of accepted offer', async () => {
      const { verifyAuthToken } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(verifyAuthToken).mockResolvedValue({
        id: 'provider-user',
        email: 'provider@example.com',
        name: 'Provider User',
        role: 'USER',
      });

      vi.mocked(prisma.offer.findUnique).mockResolvedValue({
        id: 'offer-123',
        providerId: 'provider-user',
        isAccepted: true, // Already accepted
        job: { status: 'IN_PROGRESS' },
      } as any);

      const { DELETE } = await import('@/app/api/offers/[id]/route');

      const request = new NextRequest('http://localhost/api/offers/offer-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'offer-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot withdraw an accepted offer');
    });
  });
});
