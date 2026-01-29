import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerId = params.id;

    // Get the offer with job details
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        job: {
          select: { id: true, posterId: true, status: true, title: true },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Only job poster can reject offers
    if (offer.job.posterId !== user.id) {
      return NextResponse.json(
        { error: 'Only the job poster can reject offers' },
        { status: 403 }
      );
    }

    // Check if job is still open
    if (offer.job.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Cannot reject offers on jobs that are not open' },
        { status: 400 }
      );
    }

    // Check if offer is already accepted
    if (offer.isAccepted) {
      return NextResponse.json(
        { error: 'Cannot reject an already accepted offer' },
        { status: 400 }
      );
    }

    // Use transaction to delete offer and send notification
    await prisma.$transaction(async (tx) => {
      // Create notification for provider before deleting
      await tx.notification.create({
        data: {
          type: 'OFFER_REJECTED',
          title: 'Offer not selected',
          body: `Your offer for "${offer.job.title}" was not selected`,
          data: { jobId: offer.job.id },
          userId: offer.providerId,
        },
      });

      // Delete the offer (rejection means removal)
      await tx.offer.delete({
        where: { id: offerId },
      });
    });

    return NextResponse.json({ message: 'Offer rejected successfully' });
  } catch (error) {
    console.error('Reject offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
