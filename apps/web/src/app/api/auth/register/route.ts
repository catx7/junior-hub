import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { registerSchema } from '@localservices/shared';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header - REQUIRED for registration
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Firebase authentication required for registration',
          },
        },
        { status: 401 }
      );
    }

    // Verify Firebase token
    let firebaseUid: string;
    try {
      const decodedToken = await verifyIdToken(token);
      firebaseUid = decodedToken.uid;
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired authentication token',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;

    // Check if user already exists by email or firebaseUid
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { firebaseUid }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'User with this email or Firebase account already exists',
          },
        },
        { status: 409 }
      );
    }

    // Create user in database with verified Firebase UID
    const user = await prisma.user.create({
      data: {
        email,
        name,
        firebaseUid,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user',
        },
      },
      { status: 500 }
    );
  }
}
