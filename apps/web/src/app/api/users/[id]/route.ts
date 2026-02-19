import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        address: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            jobsPosted: true,
            jobsAccepted: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format response
    const response = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      location: user.address,
      rating: user.rating,
      reviewCount: user.reviewCount,
      isVerified: user.isVerified,
      memberSince: user.createdAt.toISOString(),
      jobsPosted: user._count.jobsPosted,
      jobsCompleted: user._count.jobsAccepted,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
