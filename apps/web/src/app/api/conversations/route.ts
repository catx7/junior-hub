import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

const createConversationSchema = z.object({
  participantId: z.string().min(1),
  jobId: z.string().optional(),
});

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

    const unreadMap = new Map(unreadCounts.map((c) => [c.conversationId, c._count]));

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

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validationResult = createConversationSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const { participantId, jobId } = validationResult.data;

    if (participantId === authUser.id) {
      return NextResponse.json(
        {
          error: { code: 'INVALID_REQUEST', message: 'Cannot start a conversation with yourself' },
        },
        { status: 400 }
      );
    }

    // Check if a direct conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: authUser.id } } },
          { participants: { some: { userId: participantId } } },
        ],
        ...(jobId ? { jobId } : { jobId: null }),
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new conversation with both participants
    const conversation = await prisma.conversation.create({
      data: {
        ...(jobId ? { jobId } : {}),
        participants: {
          create: [{ userId: authUser.id }, { userId: participantId }],
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return serverErrorResponse();
  }
}
