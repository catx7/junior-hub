import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { updateJobSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            createdAt: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        promotion: {
          where: {
            isActive: true,
            endDate: { gte: new Date() },
          },
        },
        _count: {
          select: { offers: true, bookingRequests: true },
        },
      },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    return NextResponse.json({
      ...job,
      budget: Number(job.budget),
      offerCount: job._count.offers,
      bookingRequestCount: job._count.bookingRequests,
      isPromoted: !!job.promotion,
      _count: undefined,
      promotion: undefined,
    });
  } catch (error) {
    console.error('Get job error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    if (job.posterId !== authUser.id) {
      return forbiddenResponse();
    }

    if (job.status !== 'DRAFT' && job.status !== 'OPEN') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot edit a job that is in progress or completed',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateJobSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: validationResult.data,
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json({
      ...updatedJob,
      budget: Number(updatedJob.budget),
    });
  } catch (error) {
    console.error('Update job error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    if (job.posterId !== authUser.id && authUser.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    if (job.status === 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot delete a job that is in progress',
          },
        },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return serverErrorResponse();
  }
}
