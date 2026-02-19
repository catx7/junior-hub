import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import { createIdnormSession } from '@/lib/idnorm';
import { z } from 'zod';

const createSessionSchema = z.object({
  motivation: z.string().min(20).max(2000).trim(),
});

export const POST = withLogging(
  async (request: NextRequest) => {
    const authUser = await authenticate(request);
    if (!authUser) return unauthorizedResponse();

    if (authUser.role !== 'USER') {
      return forbiddenResponse('Only regular users can request provider status');
    }

    // Block duplicate pending requests
    const existing = await prisma.verificationRequest.findFirst({
      where: { userId: authUser.id, status: 'PENDING' },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_REQUEST',
            message: 'You already have a pending verification request',
          },
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/settings/become-provider?verification=complete`;

    // Create idnorm verification session
    const session = await createIdnormSession({
      externalUserId: authUser.id,
      callbackUrl,
    });

    // Create verification request in DB
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: authUser.id,
        status: 'PENDING',
        motivation: parsed.data.motivation,
        idnormSessionId: session.sessionId,
        idnormStatus: 'created',
      },
    });

    return NextResponse.json(
      {
        requestId: verificationRequest.id,
        verificationUrl: session.verificationUrl,
        sessionId: session.sessionId,
      },
      { status: 201 }
    );
  },
  { route: '/api/verification/create-session' }
);
