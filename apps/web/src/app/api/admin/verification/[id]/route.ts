import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { updateVerificationStatusSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const requestId = params.id;
    const body = await request.json();

    const validationResult = updateVerificationStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const { status, notes } = validationResult.data;

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!verificationRequest) {
      return notFoundResponse('Verification request');
    }

    if (verificationRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_REVIEWED',
            message: 'This request has already been reviewed',
          },
        },
        { status: 400 }
      );
    }

    const newStatus = status === 'approved' ? 'APPROVED' : 'REJECTED';

    if (status === 'approved') {
      // Atomically update request status AND promote user to PROVIDER
      const [updatedRequest] = await prisma.$transaction([
        prisma.verificationRequest.update({
          where: { id: requestId },
          data: {
            status: newStatus,
            notes: notes || verificationRequest.notes,
            reviewedAt: new Date(),
            reviewedBy: authUser.id,
          },
        }),
        prisma.user.update({
          where: { id: verificationRequest.userId },
          data: {
            role: 'PROVIDER',
            isVerified: true,
          },
        }),
        prisma.notification.create({
          data: {
            type: 'SYSTEM',
            title: 'Verification Approved!',
            body: 'Congratulations! Your provider verification has been approved. You can now post service offerings.',
            userId: verificationRequest.userId,
            data: { verificationRequestId: requestId },
          },
        }),
      ]);

      return NextResponse.json({
        ...updatedRequest,
        status: updatedRequest.status.toLowerCase(),
      });
    } else {
      const updatedRequest = await prisma.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          notes: notes || verificationRequest.notes,
          reviewedAt: new Date(),
          reviewedBy: authUser.id,
        },
      });

      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Verification Update',
          body:
            'Your provider verification request was not approved.' +
            (notes ? ` Reason: ${notes}` : ''),
          userId: verificationRequest.userId,
          data: { verificationRequestId: requestId },
        },
      });

      return NextResponse.json({
        ...updatedRequest,
        status: updatedRequest.status.toLowerCase(),
      });
    }
  } catch (error) {
    console.error('Update verification status error:', error);
    return serverErrorResponse();
  }
}
