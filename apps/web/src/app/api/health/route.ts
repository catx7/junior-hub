import { NextResponse } from 'next/server';
import { prisma } from '@localservices/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const start = performance.now();

  try {
    // Check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - start);

    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'up', latencyMs: dbLatencyMs },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'down', error: 'Connection failed' },
        },
      },
      { status: 503 }
    );
  }
}
