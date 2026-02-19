import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import { verifyIdToken } from '@/lib/firebase-admin';
import { withLogging } from '@/lib/api-handler';

// Server-side schema: only name & email needed (password is handled by Firebase)
const serverRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
});

export const POST = withLogging(
  async (request: NextRequest) => {
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
    const validationResult = serverRegisterSchema.safeParse(body);
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
  },
  { route: '/api/auth/register' }
);
