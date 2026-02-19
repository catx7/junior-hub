import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyWebhookSignature } from '@/lib/idnorm';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const rawBody = Buffer.from(await request.arrayBuffer());
    const signature = request.headers.get('Idnorm-Signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn('idnorm webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody.toString());
    const { sessionId, status } = payload;

    logger.info('idnorm webhook received', { sessionId, status });

    // Find the verification request
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { idnormSessionId: sessionId },
    });

    if (!verificationRequest) {
      logger.warn('idnorm webhook: unknown sessionId', { sessionId });
      return NextResponse.json({ error: 'Unknown session' }, { status: 404 });
    }

    // Update the verification request with results
    await prisma.verificationRequest.update({
      where: { id: verificationRequest.id },
      data: {
        idnormStatus: status,
        idnormResult: payload,
      },
    });

    logger.info('idnorm webhook processed', {
      requestId: verificationRequest.id,
      status,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('idnorm webhook error', { error });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
