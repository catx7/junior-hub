import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const reviews = await prisma.review.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Get admin reviews error:', error);
    return serverErrorResponse();
  }
}
