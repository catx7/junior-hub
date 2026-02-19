import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: { id: true, posterId: true, title: true },
        },
      },
    });

    if (!bookingRequest) {
      return notFoundResponse('Booking request');
    }

    // Only the provider (job poster) can reject
    if (bookingRequest.job.posterId !== authUser.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the service provider can reject booking requests',
          },
        },
        { status: 403 }
      );
    }

    if (bookingRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: `This booking request has already been ${bookingRequest.status.toLowerCase()}`,
          },
        },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.bookingRequest.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      }),
      prisma.notification.create({
        data: {
          type: 'OFFER_REJECTED',
          title: 'Booking request declined',
          body: `${authUser.name} declined your booking request for: ${bookingRequest.job.title}`,
          data: { jobId: bookingRequest.jobId, bookingRequestId: params.id },
          userId: bookingRequest.clientId,
          jobId: bookingRequest.jobId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject booking error:', error);
    return serverErrorResponse();
  }
}
