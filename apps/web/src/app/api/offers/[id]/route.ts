import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

// GET single offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerId = params.id;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
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
        job: {
          select: {
            id: true,
            title: true,
            posterId: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Only job poster or offer provider can view offer details
    if (offer.job.posterId !== user.id && offer.providerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Get offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw offer (provider only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offerId = params.id;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        job: {
          select: { status: true },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Only offer provider can withdraw their offer
    if (offer.providerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the offer provider can withdraw this offer' },
        { status: 403 }
      );
    }

    // Cannot withdraw accepted offers
    if (offer.isAccepted) {
      return NextResponse.json(
        { error: 'Cannot withdraw an accepted offer' },
        { status: 400 }
      );
    }

    // Cannot withdraw if job is no longer open
    if (offer.job.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Cannot withdraw offer on jobs that are not open' },
        { status: 400 }
      );
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({ message: 'Offer withdrawn successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
