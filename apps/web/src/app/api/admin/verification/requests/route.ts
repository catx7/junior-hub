import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Transform to match the admin frontend's expected shape (lowercase status)
    const data = requests.map((req) => ({
      id: req.id,
      userId: req.userId,
      user: req.user,
      status: req.status.toLowerCase(),
      documents: req.documents as {
        idCard: string;
        backgroundCheck: string;
        references: string[];
      },
      submittedAt: req.submittedAt.toISOString(),
      reviewedAt: req.reviewedAt?.toISOString() || null,
      reviewedBy: req.reviewedBy,
      notes: req.notes || '',
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get verification requests error:', error);
    return serverErrorResponse();
  }
}
