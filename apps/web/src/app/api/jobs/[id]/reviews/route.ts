import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const body = await request.json();
    const { rating, comment } = createReviewSchema.parse(body);

    // Get the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { reviews: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if job is completed
    if (job.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed jobs' },
        { status: 400 }
      );
    }

    // Determine who is being reviewed
    const isJobPoster = job.posterId === user.id;
    const isJobProvider = job.providerId === user.id;

    if (!isJobPoster && !isJobProvider) {
      return NextResponse.json(
        { error: 'You are not part of this job' },
        { status: 403 }
      );
    }

    // Check if user already reviewed this job
    const existingReview = job.reviews.find(r => r.authorId === user.id);
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this job' },
        { status: 400 }
      );
    }

    // Determine target user (the other party)
    const targetId = isJobPoster ? job.providerId : job.posterId;

    if (!targetId) {
      return NextResponse.json(
        { error: 'No provider assigned to this job' },
        { status: 400 }
      );
    }

    // Create review and update target user's rating
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          jobId,
          authorId: user.id,
          targetId,
          rating,
          comment,
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Calculate new average rating for target user
      const targetReviews = await tx.review.findMany({
        where: { targetId },
      });

      const avgRating =
        targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length;

      // Update target user's rating
      await tx.user.update({
        where: { id: targetId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: targetReviews.length,
        },
      });

      // Create notification for the target user
      await tx.notification.create({
        data: {
          type: 'NEW_REVIEW',
          title: 'New review received',
          body: `${user.name} left you a ${rating}-star review`,
          data: { jobId, reviewId: newReview.id, rating },
          userId: targetId,
        },
      });

      return newReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    const reviews = await prisma.review.findMany({
      where: { jobId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        target: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
