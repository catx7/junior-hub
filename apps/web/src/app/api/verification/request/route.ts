import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createVerificationRequestSchema } from '@localservices/shared';
import {
  authenticate,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    if (authUser.role !== 'USER') {
      return forbiddenResponse('Only regular users can request provider status');
    }

    // Block duplicate pending requests
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: authUser.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
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
    const validationResult = createVerificationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const { motivation, documentUrl, backgroundCheckUrl, backgroundCheckDeclaration } =
      validationResult.data;

    const documents: Record<string, string | boolean> = {};
    if (documentUrl) documents.idCard = documentUrl;
    if (backgroundCheckUrl) documents.backgroundCheck = backgroundCheckUrl;
    if (backgroundCheckDeclaration !== undefined) {
      documents.backgroundCheckDeclaration = backgroundCheckDeclaration;
    }

    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: authUser.id,
        status: 'PENDING',
        motivation,
        documents,
      },
    });

    return NextResponse.json(verificationRequest, { status: 201 });
  } catch (error) {
    console.error('Create verification request error:', error);
    return serverErrorResponse();
  }
}
