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

    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        isVerified: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return serverErrorResponse();
  }
}
