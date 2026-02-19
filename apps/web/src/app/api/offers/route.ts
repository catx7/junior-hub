import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-middleware';

// GET - List offers for the current user
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // pending, accepted, rejected
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      providerId: authUser.id,
    };

    if (status === 'pending') {
      where.isAccepted = false;
      where.job = { status: 'OPEN' };
    } else if (status === 'accepted') {
      where.isAccepted = true;
    } else if (status === 'rejected') {
      where.isAccepted = false;
      where.job = { status: { not: 'OPEN' } };
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              budget: true,
              location: true,
              status: true,
              createdAt: true,
              poster: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  rating: true,
                },
              },
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
              _count: {
                select: { offers: true },
              },
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);

    const data = offers.map((offer) => ({
      ...offer,
      price: Number(offer.price),
      job: {
        ...offer.job,
        budget: Number(offer.job.budget),
        offerCount: offer.job._count.offers,
        _count: undefined,
      },
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List user offers error:', error);
    return serverErrorResponse();
  }
}
