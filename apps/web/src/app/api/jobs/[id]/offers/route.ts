import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createOfferSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    // Only job poster can see all offers
    if (job.posterId !== authUser.id) {
      // Providers can only see their own offer
      const myOffer = await prisma.offer.findUnique({
        where: {
          jobId_providerId: {
            jobId: params.id,
            providerId: authUser.id,
          },
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
      });

      if (myOffer) {
        return NextResponse.json({
          offers: [
            {
              ...myOffer,
              price: Number(myOffer.price),
            },
          ],
        });
      }

      return NextResponse.json({ offers: [] });
    }

    const offers = await prisma.offer.findMany({
      where: { jobId: params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      offers: offers.map((offer) => ({
        ...offer,
        price: Number(offer.price),
      })),
    });
  } catch (error) {
    console.error('List offers error:', error);
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

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    // Cannot submit offer on own job
    if (job.posterId === authUser.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot submit an offer on your own job',
          },
        },
        { status: 403 }
      );
    }

    // Check job status
    if (job.status !== 'OPEN') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'This job is not accepting offers',
          },
        },
        { status: 403 }
      );
    }

    // Check for existing offer
    const existingOffer = await prisma.offer.findUnique({
      where: {
        jobId_providerId: {
          jobId: params.id,
          providerId: authUser.id,
        },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'You have already submitted an offer for this job',
          },
        },
        { status: 409 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createOfferSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const offer = await prisma.offer.create({
      data: {
        ...validationResult.data,
        jobId: params.id,
        providerId: authUser.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    // Create notification for job poster
    await prisma.notification.create({
      data: {
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: `${authUser.name} submitted an offer`,
        data: { jobId: params.id, offerId: offer.id },
        userId: job.posterId,
      },
    });

    return NextResponse.json(
      {
        ...offer,
        price: Number(offer.price),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create offer error:', error);
    return serverErrorResponse();
  }
}
