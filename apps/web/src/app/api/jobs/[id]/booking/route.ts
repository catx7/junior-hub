import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createBookingRequestSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
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
      select: { posterId: true, jobType: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    if (job.jobType !== 'SERVICE_OFFERING') {
      return NextResponse.json({ bookingRequests: [] });
    }

    // Provider (job poster) sees all booking requests, client sees only their own
    if (job.posterId === authUser.id) {
      const bookingRequests = await prisma.bookingRequest.findMany({
        where: { jobId: params.id },
        include: {
          client: {
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

      // Find conversations for this job to map to each booking
      const conversations = await prisma.conversation.findMany({
        where: { jobId: params.id },
        include: {
          participants: { select: { userId: true } },
        },
      });

      return NextResponse.json({
        bookingRequests: bookingRequests.map((br) => {
          const conv = conversations.find(
            (c) =>
              c.participants.some((p) => p.userId === br.clientId) &&
              c.participants.some((p) => p.userId === job.posterId)
          );
          return {
            ...br,
            conversationId: conv?.id || null,
          };
        }),
      });
    }

    // Client sees only their own booking request
    const myBooking = await prisma.bookingRequest.findUnique({
      where: {
        jobId_clientId: {
          jobId: params.id,
          clientId: authUser.id,
        },
      },
    });

    if (myBooking) {
      const conv = await prisma.conversation.findFirst({
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
        bookingRequests: [{ ...myBooking, conversationId: conv?.id || null }],
      });
    }

    return NextResponse.json({ bookingRequests: [] });
  } catch (error) {
    console.error('List booking requests error:', error);
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
      select: { posterId: true, status: true, jobType: true, title: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    // Only service offerings accept booking requests
    if (job.jobType !== 'SERVICE_OFFERING') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message:
              'Booking requests are only for service offerings. Use "Make an Offer" for service requests.',
          },
        },
        { status: 403 }
      );
    }

    // Cannot book own service
    if (job.posterId === authUser.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot request booking on your own service offering',
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
            message: 'This service is not currently accepting booking requests',
          },
        },
        { status: 403 }
      );
    }

    // Check for existing booking request
    const existingBooking = await prisma.bookingRequest.findUnique({
      where: {
        jobId_clientId: {
          jobId: params.id,
          clientId: authUser.id,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'You have already submitted a booking request for this service',
          },
        },
        { status: 409 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createBookingRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    // Content moderation
    const moderation = moderateContent(validationResult.data.message);
    if (!moderation.isClean) {
      return validationErrorResponse([{ message: moderation.reason }]);
    }

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        preferredDate: validationResult.data.preferredDate,
        message: validationResult.data.message,
        jobId: params.id,
        clientId: authUser.id,
      },
    });

    // Create or find conversation between client and provider
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

    // Create initial message with booking request details
    const formattedDate = new Date(validationResult.data.preferredDate).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: authUser.id,
        content: `📅 Booking Request for ${formattedDate}\n\n${validationResult.data.message}`,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        type: 'NEW_OFFER',
        title: 'New booking request',
        body: `${authUser.name} wants to book your service: ${job.title}`,
        data: {
          jobId: params.id,
          bookingRequestId: bookingRequest.id,
          conversationId: conversation.id,
        },
        userId: job.posterId,
      },
    });

    return NextResponse.json(
      {
        ...bookingRequest,
        conversationId: conversation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking request error:', error);
    return serverErrorResponse();
  }
}
