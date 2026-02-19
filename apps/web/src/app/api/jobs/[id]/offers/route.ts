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
import { moderateContent } from '@/lib/content-moderation';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
        // Find conversation for this provider-poster pair
        const myConversation = await prisma.conversation.findFirst({
          where: {
            jobId: params.id,
            AND: [
              { participants: { some: { userId: authUser.id } } },
              { participants: { some: { userId: job.posterId } } },
            ],
          },
          select: { id: true },
        });

        return NextResponse.json({
          offers: [
            {
              ...myOffer,
              price: Number(myOffer.price),
              conversationId: myConversation?.id || null,
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

    // Fetch conversations for this job to map to each offer
    const conversations = await prisma.conversation.findMany({
      where: { jobId: params.id },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    return NextResponse.json({
      offers: offers.map((offer) => {
        const conv = conversations.find(
          (c) =>
            c.participants.some((p) => p.userId === offer.providerId) &&
            c.participants.some((p) => p.userId === job.posterId)
        );
        return {
          ...offer,
          price: Number(offer.price),
          conversationId: conv?.id || null,
        };
      }),
    });
  } catch (error) {
    console.error('List offers error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true, jobType: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    // Cannot make offers on service offerings - use booking requests instead
    if (job.jobType === 'SERVICE_OFFERING') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot make offers on service offerings. Use "Request Booking" instead.',
          },
        },
        { status: 403 }
      );
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

    // Content moderation: block contact info in offer message
    if (validationResult.data.message) {
      const moderation = moderateContent(validationResult.data.message);
      if (!moderation.isClean) {
        return validationErrorResponse([{ message: moderation.reason }]);
      }
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

    // Create conversation between provider and job poster
    let conversation = await prisma.conversation.findFirst({
      where: {
        jobId: params.id,
        AND: [
          { participants: { some: { userId: authUser.id } } },
          { participants: { some: { userId: job.posterId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          jobId: params.id,
          participants: {
            create: [{ userId: authUser.id }, { userId: job.posterId }],
          },
        },
      });
    }

    // Create initial message in conversation with offer details
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: authUser.id,
        content: `📋 New Offer: $${Number(validationResult.data.price).toFixed(2)}\n\n${validationResult.data.message}`,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Create notification for job poster
    await prisma.notification.create({
      data: {
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: `${authUser.name} submitted an offer`,
        data: { jobId: params.id, offerId: offer.id, conversationId: conversation.id },
        userId: job.posterId,
      },
    });

    return NextResponse.json(
      {
        ...offer,
        price: Number(offer.price),
        conversationId: conversation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create offer error:', error);
    return serverErrorResponse();
  }
}
