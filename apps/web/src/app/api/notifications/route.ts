import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {
      userId: authUser.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: authUser.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.body,
        data: n.data,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'markAllRead') {
      await prisma.notification.updateMany({
        where: {
          userId: authUser.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else if (action === 'markRead' && notificationIds?.length) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: authUser.id,
        },
        data: { isRead: true },
      });
    } else if (action === 'clearAll') {
      await prisma.notification.deleteMany({
        where: { userId: authUser.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notifications error:', error);
    return serverErrorResponse();
  }
}
