import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

const sendNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.string(),
  targetType: z.enum(['all', 'specific']),
  userId: z.string().optional(),
  jobId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();

    const validationResult = sendNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const {
      title,
      body: notificationBody,
      type,
      targetType,
      userId,
      jobId,
    } = validationResult.data;

    let targetUserIds: string[] = [];

    if (targetType === 'all') {
      // Get all user IDs
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (targetType === 'specific' && userId) {
      targetUserIds = [userId];
    } else {
      return NextResponse.json({ error: 'Invalid target configuration' }, { status: 400 });
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map((uid) => ({
        userId: uid,
        type,
        title,
        body: notificationBody,
        jobId: jobId || null,
        isRead: false,
      })),
    });

    // TODO: Send push notifications via FCM
    // This would involve fetching FCM tokens and sending via Firebase Admin SDK

    return NextResponse.json({
      success: true,
      sentCount: notifications.count,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return serverErrorResponse();
  }
}
