import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { withLogging } from '@/lib/api-handler';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://juniorhub.ro';

export const GET = withLogging(
  async (request: NextRequest) => {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${APP_URL}?error=missing_token`);
    }

    // Find valid, unused token
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, emailVerified: true } } },
    });

    if (!verification) {
      return NextResponse.redirect(`${APP_URL}?error=invalid_token`);
    }

    if (verification.usedAt) {
      return NextResponse.redirect(`${APP_URL}?message=email_already_verified`);
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.redirect(`${APP_URL}?error=token_expired`);
    }

    // Mark token as used and verify user email
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      prisma.auditLog.create({
        data: {
          actorId: verification.userId,
          action: 'user.email_verified',
          targetType: 'User',
          targetId: verification.userId,
          metadata: {},
          ipAddress:
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown',
        },
      }),
    ]);

    // Redirect to homepage with success message
    return NextResponse.redirect(`${APP_URL}?message=email_verified`);
  },
  { route: '/api/auth/verify-email' }
);
