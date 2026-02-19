import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyIdToken } from './firebase-admin';
import { logger } from './logger';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedToken = await verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    logger.warn('Auth token verification failed', { error });
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    },
    { status: 401 }
  );
}

export function forbiddenResponse(message?: string) {
  return NextResponse.json(
    {
      error: {
        code: 'FORBIDDEN',
        message: message || 'You do not have permission to perform this action',
      },
    },
    { status: 403 }
  );
}

export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
      },
    },
    { status: 404 }
  );
}

export function validationErrorResponse(errors: unknown) {
  return NextResponse.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors,
      },
    },
    { status: 400 }
  );
}

export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    { status: 500 }
  );
}

// Alias for backwards compatibility - routes may import this name
export const verifyAuthToken = authenticate;
