import { logger } from './logger';
import { withTiming } from './timing';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaVerifyResult {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string
): Promise<{ valid: boolean; score: number }> {
  // In development, skip reCAPTCHA verification
  if (process.env.NODE_ENV === 'development') {
    return { valid: true, score: 1.0 };
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    logger.error('RECAPTCHA_SECRET_KEY is not set');
    return { valid: false, score: 0 };
  }

  const response = await withTiming('recaptcha.verify', () =>
    fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })
  );

  const result: RecaptchaVerifyResult = await response.json();

  if (!result.success) {
    return { valid: false, score: 0 };
  }

  if (expectedAction && result.action !== expectedAction) {
    return { valid: false, score: result.score };
  }

  return { valid: result.score >= 0.5, score: result.score };
}
