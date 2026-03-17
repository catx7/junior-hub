import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { randomBytes } from 'crypto';
import { authenticate, unauthorizedResponse } from '@/lib/auth-middleware';
import { withLogging } from '@/lib/api-handler';
import { sendVerificationEmail } from '@/lib/email';

export const POST = withLogging(
  async (request: NextRequest) => {
    const user = await authenticate(request);
    if (!user) return unauthorizedResponse();

    // Check if already verified
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true, email: true, name: true },
    });

    if (fullUser?.emailVerified) {
      return NextResponse.json(
        { error: { code: 'ALREADY_VERIFIED', message: 'Email deja verificat' } },
        { status: 400 }
      );
    }

    // Rate limit: max 1 verification email per 2 minutes
    const recentVerification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentVerification) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Asteapta 2 minute inainte de a trimite din nou',
          },
        },
        { status: 429 }
      );
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email (non-blocking)
    sendVerificationEmail(fullUser!.email, fullUser!.name, token).catch(() => {});

    return NextResponse.json({ message: 'Email de verificare trimis' });
  },
  { route: '/api/auth/send-verification' }
);
