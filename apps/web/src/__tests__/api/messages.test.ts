import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@localservices/database');
vi.mock('@/lib/auth-middleware');

describe('Messages API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/conversations/[id]/messages', () => {
    it('should reject unauthenticated requests', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      vi.mocked(authenticate).mockResolvedValue(null);

      const { POST } = await import('@/app/api/conversations/[id]/messages/route');

      const request = new NextRequest('http://localhost/api/conversations/conv-123/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello' }),
      });

      const response = await POST(request, { params: { id: 'conv-123' } });
      expect(response.status).toBe(401);
    });

    it('should reject message from non-participant', async () => {
      const { authenticate, forbiddenResponse } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'other-user',
        email: 'other@example.com',
        name: 'Other User',
        role: 'USER',
      });

      vi.mocked(prisma.conversationParticipant.findUnique).mockResolvedValue(null);

      const { POST } = await import('@/app/api/conversations/[id]/messages/route');

      const request = new NextRequest('http://localhost/api/conversations/conv-123/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello' }),
      });

      const response = await POST(request, { params: { id: 'conv-123' } });
      expect(response.status).toBe(403);
    });

    it('should reject invalid imageUrl (non-Cloudinary)', async () => {
      const { authenticate, validationErrorResponse } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      });

      vi.mocked(prisma.conversationParticipant.findUnique).mockResolvedValue({
        conversationId: 'conv-123',
        userId: 'user-123',
      } as any);

      const { POST } = await import('@/app/api/conversations/[id]/messages/route');

      const request = new NextRequest('http://localhost/api/conversations/conv-123/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Check this image',
          imageUrl: 'https://evil-site.com/malicious.jpg', // Not Cloudinary
        }),
      });

      const response = await POST(request, { params: { id: 'conv-123' } });
      expect(response.status).toBe(400);
    });

    it('should accept valid Cloudinary imageUrl', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      });

      vi.mocked(prisma.conversationParticipant.findUnique).mockResolvedValue({
        conversationId: 'conv-123',
        userId: 'user-123',
      } as any);

      vi.mocked(prisma.conversationParticipant.findFirst).mockResolvedValue({
        userId: 'other-user',
      } as any);

      vi.mocked(prisma.message.create).mockResolvedValue({
        id: 'msg-123',
        content: 'Check this image',
        imageUrl: 'https://res.cloudinary.com/localservices/image/upload/v1234/photo.jpg',
        conversationId: 'conv-123',
        senderId: 'user-123',
        createdAt: new Date(),
        sender: { id: 'user-123', name: 'Test User', avatar: null },
      } as any);

      vi.mocked(prisma.conversation.update).mockResolvedValue({} as any);
      vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

      const { POST } = await import('@/app/api/conversations/[id]/messages/route');

      const request = new NextRequest('http://localhost/api/conversations/conv-123/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Check this image',
          imageUrl: 'https://res.cloudinary.com/localservices/image/upload/v1234/photo.jpg',
        }),
      });

      const response = await POST(request, { params: { id: 'conv-123' } });
      expect(response.status).toBe(201);
    });

    it('should create notification for other participant', async () => {
      const { authenticate } = await import('@/lib/auth-middleware');
      const { prisma } = await import('@localservices/database');

      vi.mocked(authenticate).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      });

      vi.mocked(prisma.conversationParticipant.findUnique).mockResolvedValue({
        conversationId: 'conv-123',
        userId: 'user-123',
      } as any);

      vi.mocked(prisma.conversationParticipant.findFirst).mockResolvedValue({
        userId: 'other-user-456',
      } as any);

      vi.mocked(prisma.message.create).mockResolvedValue({
        id: 'msg-123',
        content: 'Hello there!',
        imageUrl: null,
        conversationId: 'conv-123',
        senderId: 'user-123',
        createdAt: new Date(),
        sender: { id: 'user-123', name: 'Test User', avatar: null },
      } as any);

      vi.mocked(prisma.conversation.update).mockResolvedValue({} as any);
      vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

      const { POST } = await import('@/app/api/conversations/[id]/messages/route');

      const request = new NextRequest('http://localhost/api/conversations/conv-123/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello there!' }),
      });

      const response = await POST(request, { params: { id: 'conv-123' } });

      expect(response.status).toBe(201);
      expect(vi.mocked(prisma.notification.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'NEW_MESSAGE',
            userId: 'other-user-456',
          }),
        })
      );
    });
  });
});
