import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';

const tokenSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = tokenSchema.parse(body);

    // Store or update FCM token for user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fcmToken: token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Save FCM token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
