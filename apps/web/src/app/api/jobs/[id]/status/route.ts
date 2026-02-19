import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_COMPLETION', 'COMPLETED', 'CANCELLED']),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
        scheduledAt: true,
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
      IN_PROGRESS: ['PENDING_COMPLETION', 'CANCELLED'],
      PENDING_COMPLETION: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[job.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${job.status} to ${status}` },
        { status: 400 }
      );
    }

    // Permission checks
    if (status === 'CANCELLED' && !isPoster) {
      return NextResponse.json({ error: 'Only the job poster can cancel a job' }, { status: 403 });
    }

    if (status === 'PENDING_COMPLETION' && !isProvider) {
      return NextResponse.json(
        { error: 'Only the provider can mark a job as complete' },
        { status: 403 }
      );
    }

    if (status === 'COMPLETED' && !isPoster) {
      return NextResponse.json(
        { error: 'Only the job poster can confirm completion' },
        { status: 403 }
      );
    }

    // Poster can reject completion (send back to IN_PROGRESS from PENDING_COMPLETION)
    if (status === 'IN_PROGRESS' && job.status === 'PENDING_COMPLETION' && !isPoster) {
      return NextResponse.json(
        { error: 'Only the job poster can reject completion' },
        { status: 403 }
      );
    }

    // Date check: cannot mark as complete before scheduled date
    if (status === 'PENDING_COMPLETION' && job.scheduledAt) {
      if (new Date(job.scheduledAt) > new Date()) {
        return NextResponse.json(
          { error: 'Job cannot be marked complete before the scheduled date' },
          { status: 400 }
        );
      }
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
        PENDING_COMPLETION: {
          title: 'Completion requested',
          body: `${user.name} marked "${job.title}" as complete. Please review and confirm.`,
        },
        COMPLETED: {
          title: 'Job completed!',
          body: `The job "${job.title}" has been confirmed as completed`,
        },
        CANCELLED: {
          title: 'Job cancelled',
          body: `The job "${job.title}" has been cancelled`,
        },
        IN_PROGRESS:
          job.status === 'PENDING_COMPLETION'
            ? {
                title: 'Completion not confirmed',
                body: `The poster sent "${job.title}" back to in progress`,
              }
            : {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
