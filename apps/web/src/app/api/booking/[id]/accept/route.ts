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
          select: { id: true, posterId: true, title: true, status: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    });

    if (!bookingRequest) {
      return notFoundResponse('Booking request');
    }

    // Only the provider (job poster) can accept
    if (bookingRequest.job.posterId !== authUser.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only the service provider can accept booking requests',
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

    // Accept the booking: update request status, assign provider/client on job, set job to IN_PROGRESS
    await prisma.$transaction([
      prisma.bookingRequest.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' },
      }),
      prisma.job.update({
        where: { id: bookingRequest.jobId },
        data: {
          status: 'IN_PROGRESS',
          providerId: bookingRequest.clientId,
          scheduledAt: bookingRequest.preferredDate,
        },
      }),
      // Reject all other pending booking requests for this job
      prisma.bookingRequest.updateMany({
        where: {
          jobId: bookingRequest.jobId,
          id: { not: params.id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      }),
      // Notify the client
      prisma.notification.create({
        data: {
          type: 'OFFER_ACCEPTED',
          title: 'Booking accepted!',
          body: `${authUser.name} accepted your booking request for: ${bookingRequest.job.title}`,
          data: { jobId: bookingRequest.jobId, bookingRequestId: params.id },
          userId: bookingRequest.clientId,
          jobId: bookingRequest.jobId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept booking error:', error);
    return serverErrorResponse();
  }
}
