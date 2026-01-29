import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@localservices/database');
vi.mock('@/lib/auth-middleware');

describe('Jobs API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/jobs', () => {
    it('should reject unauthenticated requests', async () => {
      const { authenticate, unauthorizedResponse } = await import('@/lib/auth-middleware');
      vi.mocked(authenticate).mockResolvedValue(null);

      const { POST } = await import('@/app/api/jobs/route');

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Job',
          description: 'Test description that is long enough',
          category: 'HOUSE_CLEANING',
          budget: 100,
          location: 'Test Location',
          latitude: 45.0,
          longitude: 25.0,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should reject invalid job data', async () => {
      const { authenticate, validationErrorResponse } = await import('@/lib/auth-middleware');
      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });

      const { POST } = await import('@/app/api/jobs/route');

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Hi', // Too short
          description: 'Short', // Too short
          category: 'INVALID_CATEGORY',
          budget: -100, // Negative
          location: '',
          latitude: 200, // Out of range
          longitude: 25.0,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should create job with valid data', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });

      vi.mocked(prisma.job.create).mockResolvedValue({
        id: 'job-123',
        title: 'Test Job Title Here',
        description: 'This is a long enough description for testing purposes',
        category: 'HOUSE_CLEANING',
        budget: 100,
        currency: 'USD',
        status: 'OPEN',
        location: 'Test Location City',
        latitude: 45.0,
        longitude: 25.0,
        posterId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        poster: { id: 'user-123', name: 'Test User', avatar: null, rating: 0 },
        images: [],
      } as any);

      const { POST } = await import('@/app/api/jobs/route');

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Job Title Here',
          description: 'This is a long enough description for testing purposes',
          category: 'HOUSE_CLEANING',
          budget: 100,
          location: 'Test Location City',
          latitude: 45.0,
          longitude: 25.0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('job-123');
      expect(data.status).toBe('OPEN');
      expect(vi.mocked(prisma.job.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            posterId: 'user-123',
            status: 'OPEN',
          }),
        })
      );
    });
  });

  describe('DELETE /api/jobs/[id]', () => {
    it('should reject deletion by non-owner', async () => {
      const { authenticate, forbiddenResponse } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'other-user',
        email: 'other@example.com',
        name: 'Other User',
        role: 'USER',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'owner-user',
        status: 'OPEN',
      } as any);

      const { DELETE } = await import('@/app/api/jobs/[id]/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'job-123' } });
      expect(response.status).toBe(403);
    });

    it('should reject deletion of in-progress jobs', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'owner-user',
        email: 'owner@example.com',
        name: 'Owner User',
        role: 'USER',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'owner-user',
        status: 'IN_PROGRESS',
      } as any);

      const { DELETE } = await import('@/app/api/jobs/[id]/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'job-123' } });
      expect(response.status).toBe(403);
    });

    it('should allow admin to delete any job', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'admin-user',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      });

      vi.mocked(prisma.job.findUnique).mockResolvedValue({
        posterId: 'other-user',
        status: 'OPEN',
      } as any);

      vi.mocked(prisma.job.delete).mockResolvedValue({} as any);

      const { DELETE } = await import('@/app/api/jobs/[id]/route');

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'job-123' } });
      expect(response.status).toBe(200);
    });
  });
});
