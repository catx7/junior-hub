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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { authorId: authUser.id },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          target: {
            select: { id: true, name: true, avatar: true },
          },
          job: {
            select: { id: true, title: true, category: true, posterId: true, providerId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { authorId: authUser.id },
      }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get written reviews error:', error);
    return serverErrorResponse();
  }
}
