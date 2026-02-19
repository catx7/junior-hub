import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRecaptchaToken } from '@/lib/recaptcha';

const verifyCaptchaSchema = z.object({
  token: z.string().min(1, 'reCAPTCHA token is required'),
  action: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifyCaptchaSchema.safeParse(body);

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

    const { token, action } = validationResult.data;
    const result = await verifyRecaptchaToken(token, action);

    if (!result.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'CAPTCHA_FAILED',
            message: 'reCAPTCHA verification failed. Please try again.',
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, score: result.score });
  } catch (error) {
    console.error('Captcha verification error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify captcha',
        },
      },
      { status: 500 }
    );
  }
}
