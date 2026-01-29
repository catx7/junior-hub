import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            posterId: true,
            status: true,
            title: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!offer) {
      return notFoundResponse('Offer');
    }

    // Only job poster can accept offers
    if (offer.job.posterId !== authUser.id) {
      return forbiddenResponse();
    }

    // Preliminary check (will be verified again inside transaction)
    if (offer.job.status !== 'OPEN') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'This job is no longer accepting offers',
          },
        },
        { status: 403 }
      );
    }

    // Check if offer is already accepted or rejected
    if (offer.isAccepted || offer.isRejected) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'This offer has already been processed',
          },
        },
        { status: 409 }
      );
    }

    // Use transaction with optimistic locking to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify job status inside transaction (prevents race condition)
      const currentJob = await tx.job.findUnique({
        where: { id: offer.job.id },
        select: { status: true },
      });

      if (!currentJob || currentJob.status !== 'OPEN') {
        throw new Error('JOB_NOT_OPEN');
      }

      // Re-verify offer hasn't been processed by concurrent request
      const currentOffer = await tx.offer.findUnique({
        where: { id: params.id },
        select: { isAccepted: true, isRejected: true },
      });

      if (!currentOffer || currentOffer.isAccepted || currentOffer.isRejected) {
        throw new Error('OFFER_ALREADY_PROCESSED');
      }

      // Accept this offer
      const acceptedOffer = await tx.offer.update({
        where: { id: params.id },
        data: { isAccepted: true },
      });

      // Reject all other offers for this job
      await tx.offer.updateMany({
        where: {
          jobId: offer.job.id,
          id: { not: params.id },
        },
        data: { isRejected: true },
      });

      // Update job status and assign provider
      const updatedJob = await tx.job.update({
        where: { id: offer.job.id },
        data: {
          status: 'IN_PROGRESS',
          providerId: offer.providerId,
        },
      });

      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          jobId: offer.job.id,
          participants: {
            create: [
              { userId: authUser.id },
              { userId: offer.providerId },
            ],
          },
        },
      });

      // Create notification for provider
      await tx.notification.create({
        data: {
          type: 'OFFER_ACCEPTED',
          title: 'Offer accepted!',
          body: `Your offer for "${offer.job.title}" was accepted`,
          data: {
            jobId: offer.job.id,
            offerId: params.id,
            conversationId: conversation.id,
          },
          userId: offer.providerId,
        },
      });

      // Notify rejected providers
      const rejectedOffers = await tx.offer.findMany({
        where: {
          jobId: offer.job.id,
          id: { not: params.id },
          isRejected: true,
        },
        select: { providerId: true },
      });

      if (rejectedOffers.length > 0) {
        await tx.notification.createMany({
          data: rejectedOffers.map((o) => ({
            type: 'OFFER_REJECTED' as const,
            title: 'Offer not selected',
            body: `Your offer for "${offer.job.title}" was not selected`,
            data: { jobId: offer.job.id },
            userId: o.providerId,
          })),
        });
      }

      return { offer: acceptedOffer, job: updatedJob, conversation };
    });

    return NextResponse.json({
      offer: {
        ...result.offer,
        price: Number(result.offer.price),
        isAccepted: true,
      },
      job: {
        id: result.job.id,
        status: result.job.status,
        providerId: result.job.providerId,
      },
      conversation: {
        id: result.conversation.id,
      },
    });
  } catch (error) {
    // Handle race condition errors
    if (error instanceof Error) {
      if (error.message === 'JOB_NOT_OPEN') {
        return NextResponse.json(
          {
            error: {
              code: 'CONFLICT',
              message: 'This job is no longer accepting offers',
            },
          },
          { status: 409 }
        );
      }
      if (error.message === 'OFFER_ALREADY_PROCESSED') {
        return NextResponse.json(
          {
            error: {
              code: 'CONFLICT',
              message: 'This offer has already been processed',
            },
          },
          { status: 409 }
        );
      }
    }
    console.error('Accept offer error:', error);
    return serverErrorResponse();
  }
}
