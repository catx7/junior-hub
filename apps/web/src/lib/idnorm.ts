import { logger } from './logger';

const IDNORM_API_URL = process.env.IDNORM_API_URL || 'https://api.idnorm.com';
const IDNORM_API_SECRET = process.env.IDNORM_API_SECRET || '';
const IDNORM_CONFIG_ID = process.env.IDNORM_CONFIG_ID || '';

interface CreateSessionResponse {
  sessionId: string;
  verificationUrl: string;
  sessionToken: string;
}

interface SessionResult {
  sessionId: string;
  status: string;
  checks: Record<string, unknown>;
  [key: string]: unknown;
}

export async function createIdnormSession(params: {
  externalUserId: string;
  callbackUrl: string;
  durationInSeconds?: number;
}): Promise<CreateSessionResponse> {
  const response = await fetch(`${IDNORM_API_URL}/api/v1/create_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idnorm-License-Key': IDNORM_API_SECRET,
    },
    body: JSON.stringify({
      configId: IDNORM_CONFIG_ID,
      callbackUrl: params.callbackUrl,
      externalUserId: params.externalUserId,
      durationInSeconds: params.durationInSeconds || 1800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error('idnorm create_session failed', { status: response.status, body: err });
    throw new Error(`idnorm session creation failed: ${response.status}`);
  }

  return response.json();
}

export async function getIdnormSession(sessionId: string): Promise<SessionResult> {
  const response = await fetch(`${IDNORM_API_URL}/api/v1/session/${sessionId}`, {
    headers: {
      'Idnorm-License-Key': IDNORM_API_SECRET,
    },
  });

  if (!response.ok) {
    throw new Error(`idnorm session fetch failed: ${response.status}`);
  }

  return response.json();
}

export function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string): boolean {
  const crypto = require('crypto');
  const secret = process.env.IDNORM_WEBHOOK_SECRET || '';

  // Parse "timestamp.signature" format from Idnorm-Signature header
  const parts = signatureHeader.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, receivedSignature] = parts;

  // Validate timestamp recency (5 min window)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

  // Create 8-byte timestamp buffer + raw body
  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigInt64BE(BigInt(timestamp));
  const payload = Buffer.concat([timestampBuffer, rawBody]);

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
