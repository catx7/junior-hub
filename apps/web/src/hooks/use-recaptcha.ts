'use client';

import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyCaptcha = useCallback(
    async (action: string): Promise<void> => {
      if (!executeRecaptcha) {
        // No reCAPTCHA available (dev mode without keys)
        return;
      }

      const token = await executeRecaptcha(action);

      const res = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Captcha verification failed');
      }
    },
    [executeRecaptcha]
  );

  return { verifyCaptcha };
}
