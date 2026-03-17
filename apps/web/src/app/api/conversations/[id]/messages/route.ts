import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { sendMessageSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
} from '@/lib/auth-middleware';
import { sendPushNotification } from '@/lib/firebase-admin';
import { moderateContent } from '@/lib/content-moderation';
import { withLogging } from '@/lib/api-handler';
import { sendNewMessageEmail } from '@/lib/email';

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

export const GET = withLogging(
  async (request: NextRequest, { params }: { params: Record<string, string> }) => {
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
  },
  { route: '/api/conversations/[id]/messages' }
);

export const POST = withLogging(
  async (request: NextRequest, { params }: { params: Record<string, string> }) => {
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

    // Content moderation: block contact info in messages
    const moderation = moderateContent(content);
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

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
      const notificationTitle = 'New message';
      const notificationBody = `${authUser.name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;

      await prisma.notification.create({
        data: {
          type: 'NEW_MESSAGE',
          title: notificationTitle,
          body: notificationBody,
          data: { conversationId: params.id, messageId: message.id },
          userId: otherParticipant.userId,
        },
      });

      // Send FCM push notification + email
      const recipient = await prisma.user.findUnique({
        where: { id: otherParticipant.userId },
        select: { fcmToken: true, email: true, name: true },
      });

      if (recipient?.fcmToken) {
        const pushSuccess = await sendPushNotification(
          recipient.fcmToken,
          { title: notificationTitle, body: notificationBody },
          {
            type: 'new_message',
            conversationId: params.id,
            messageId: message.id,
          }
        );

        if (!pushSuccess) {
          await prisma.user.update({
            where: { id: otherParticipant.userId },
            data: { fcmToken: null },
          });
        }
      }

      // Send email notification if no push token (non-blocking)
      if (!recipient?.fcmToken && recipient?.email) {
        sendNewMessageEmail(
          recipient.email,
          recipient.name,
          authUser.name,
          content,
          params.id
        ).catch(() => {});
      }
    }

    return NextResponse.json(message, { status: 201 });
  },
  { route: '/api/conversations/[id]/messages' }
);
