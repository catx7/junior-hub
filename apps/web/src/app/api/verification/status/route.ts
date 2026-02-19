import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { authenticate, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const latestRequest = await prisma.verificationRequest.findFirst({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestRequest) {
      return NextResponse.json({ status: 'none', request: null });
    }

    return NextResponse.json({
      status: latestRequest.status.toLowerCase(),
      request: {
        id: latestRequest.id,
        status: latestRequest.status.toLowerCase(),
        motivation: latestRequest.motivation,
        notes: latestRequest.notes,
        idnormSessionId: latestRequest.idnormSessionId,
        idnormStatus: latestRequest.idnormStatus,
        submittedAt: latestRequest.submittedAt.toISOString(),
        reviewedAt: latestRequest.reviewedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    return serverErrorResponse();
  }
}
