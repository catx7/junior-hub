import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get reviews received by the user
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { targetId: userId },
        include: {
          author: {
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
        where: { targetId: userId },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { targetId: userId },
      _count: { rating: true },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
