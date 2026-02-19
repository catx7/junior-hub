import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const reviewId = params.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return notFoundResponse('Review');
    }

    const targetId = review.targetId;

    // Delete review and recalculate target user's rating in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Recalculate target user's rating
      const remainingReviews = await tx.review.findMany({
        where: { targetId },
      });

      if (remainingReviews.length === 0) {
        await tx.user.update({
          where: { id: targetId },
          data: {
            rating: 0,
            reviewCount: 0,
          },
        });
      } else {
        const avgRating =
          remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;

        await tx.user.update({
          where: { id: targetId },
          data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: remainingReviews.length,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return serverErrorResponse();
  }
}
