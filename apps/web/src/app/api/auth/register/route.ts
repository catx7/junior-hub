import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { z } from 'zod';
import { verifyIdToken } from '@/lib/firebase-admin';
import { withLogging } from '@/lib/api-handler';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';

// Server-side schema: name, email, and consent flags
const serverRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  consentTerms: z.boolean().optional().default(true),
  consentAge: z.boolean().optional().default(true),
  consentMarketing: z.boolean().optional().default(false),
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

    const { name, email, consentTerms, consentAge, consentMarketing } = validationResult.data;

    // Get client info for consent audit trail
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const consentVersion = new Date().toISOString().split('T')[0]; // e.g., "2026-03-15"

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

    // Create user in database with verified Firebase UID and record consent
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
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

      // Record GDPR consent (Art. 7 - must be able to demonstrate consent)
      const consentRecords = [
        {
          userId: newUser.id,
          type: 'TERMS_AND_PRIVACY' as const,
          version: consentVersion,
          granted: consentTerms,
          ipAddress,
          userAgent,
        },
        {
          userId: newUser.id,
          type: 'AGE_CONFIRMATION' as const,
          version: consentVersion,
          granted: consentAge,
          ipAddress,
          userAgent,
        },
        {
          userId: newUser.id,
          type: 'MARKETING' as const,
          version: consentVersion,
          granted: consentMarketing,
          ipAddress,
          userAgent,
        },
      ];

      await tx.consent.createMany({ data: consentRecords });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: newUser.id,
          action: 'user.register',
          targetType: 'User',
          targetId: newUser.id,
          metadata: { consentTerms, consentAge, consentMarketing },
          ipAddress,
        },
      });

      return newUser;
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(() => {});

    // Send verification email (non-blocking)
    const { randomBytes } = await import('crypto');
    const verifyToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    prisma.emailVerification
      .create({
        data: { userId: user.id, token: verifyToken, expiresAt },
      })
      .then(() => sendVerificationEmail(email, name, verifyToken))
      .catch(() => {});

    return NextResponse.json(user, { status: 201 });
  },
  { route: '/api/auth/register' }
);
