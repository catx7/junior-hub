import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

export async function PATCH(
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
    const { status } = updateStatusSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        status: true,
        posterId: true,
        providerId: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Determine who can update status
    const isPoster = job.posterId === user.id;
    const isProvider = job.providerId === user.id;

    if (!isPoster && !isProvider) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['OPEN', 'CANCELLED'],
      OPEN: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[job.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${job.status} to ${status}` },
        { status: 400 }
      );
    }

    // Additional validation based on who is updating
    if (status === 'CANCELLED' && !isPoster) {
      return NextResponse.json(
        { error: 'Only the job poster can cancel a job' },
        { status: 403 }
      );
    }

    if (status === 'COMPLETED' && !isPoster) {
      return NextResponse.json(
        { error: 'Only the job poster can mark a job as completed' },
        { status: 403 }
      );
    }

    // Update the job status and send notifications
    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.job.update({
        where: { id: jobId },
        data: {
          status,
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
        },
      });

      // Determine notification message based on status
      const notificationMessages: Record<string, { title: string; body: string }> = {
        COMPLETED: {
          title: 'Job completed!',
          body: `The job "${job.title}" has been marked as completed`,
        },
        CANCELLED: {
          title: 'Job cancelled',
          body: `The job "${job.title}" has been cancelled`,
        },
        IN_PROGRESS: {
          title: 'Job started',
          body: `The job "${job.title}" is now in progress`,
        },
      };

      const notification = notificationMessages[status];
      if (notification) {
        // Notify provider if exists and is not the one making the change
        if (job.providerId && job.providerId !== user.id) {
          await tx.notification.create({
            data: {
              type: 'JOB_STATUS_CHANGED',
              title: notification.title,
              body: notification.body,
              data: { jobId: job.id, status },
              userId: job.providerId,
            },
          });
        }

        // Notify poster if they're not the one making the change
        if (job.posterId !== user.id) {
          await tx.notification.create({
            data: {
              type: 'JOB_STATUS_CHANGED',
              title: notification.title,
              body: notification.body,
              data: { jobId: job.id, status },
              userId: job.posterId,
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Update job status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
