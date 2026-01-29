import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { sendMessageSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

// Extended schema with validated imageUrl (must be Cloudinary URL if provided)
const messageWithImageSchema = sendMessageSchema.extend({
  imageUrl: z
    .string()
    .url()
    .refine(
      (url) => url.startsWith('https://res.cloudinary.com/'),
      'Image URL must be a valid Cloudinary URL'
    )
    .optional()
    .nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: authUser.id,
        },
      },
    });

    if (!participant) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.id,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: authUser.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: authUser.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return serverErrorResponse();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: authUser.id,
        },
      },
    });

    if (!participant) {
      return forbiddenResponse();
    }

    const body = await request.json();

    // Validate input including imageUrl
    const validationResult = messageWithImageSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const { content, imageUrl } = validationResult.data;

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        imageUrl,
        conversationId: params.id,
        senderId: authUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    // Get other participant for notification
    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.id,
        userId: { not: authUser.id },
      },
      select: { userId: true },
    });

    if (otherParticipant) {
      await prisma.notification.create({
        data: {
          type: 'NEW_MESSAGE',
          title: 'New message',
          body: `${authUser.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          data: { conversationId: params.id, messageId: message.id },
          userId: otherParticipant.userId,
        },
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return serverErrorResponse();
  }
}
