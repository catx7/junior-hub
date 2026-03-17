import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { sendWeeklyDigestEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

// Protected by CRON_SECRET - called by Vercel Cron or external scheduler
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // Get users with addresses (so we know their city)
    const users = await prisma.user.findMany({
      where: {
        address: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
      },
      take: 500, // Process in batches
    });

    let sentCount = 0;

    for (const user of users) {
      if (!user.address || !user.email) continue;

      // Find recent jobs near the user's location
      const jobs = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          createdAt: { gte: oneWeekAgo },
        },
        select: {
          id: true,
          title: true,
          location: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (jobs.length === 0) continue;

      const city = user.address.split(',')[0]?.trim() || user.address;

      await sendWeeklyDigestEmail(
        user.email,
        user.name,
        jobs.map((j) => ({
          id: j.id,
          title: j.title,
          location: j.location || '',
          category: j.category,
        })),
        city
      );

      sentCount++;
    }

    logger.info('Weekly digest completed', { sentCount, totalUsers: users.length });

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    logger.error('Weekly digest error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
