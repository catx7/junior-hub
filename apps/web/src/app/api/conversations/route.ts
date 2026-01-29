import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: authUser.id,
          },
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        participants: {
          where: {
            userId: { not: authUser.id },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get unread counts
    const unreadCounts = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversation: {
          participants: {
            some: {
              userId: authUser.id,
            },
          },
        },
        senderId: { not: authUser.id },
        isRead: false,
      },
      _count: true,
    });

    const unreadMap = new Map(
      unreadCounts.map((c) => [c.conversationId, c._count])
    );

    const data = conversations.map((conv) => ({
      id: conv.id,
      job: conv.job,
      participant: conv.participants[0]?.user || null,
      lastMessage: conv.messages[0] || null,
      unreadCount: unreadMap.get(conv.id) || 0,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json({ conversations: data });
  } catch (error) {
    console.error('List conversations error:', error);
    return serverErrorResponse();
  }
}
