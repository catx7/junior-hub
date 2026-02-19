/**
 * Utility for timing external service calls (Firebase, Cloudinary, reCAPTCHA, etc.)
 */
import { logger } from './logger';

const SLOW_THRESHOLD_MS = 2000;

/**
 * Wraps an async operation with timing. Logs duration at debug level,
 * warns on slow calls (>2s), and logs errors before re-throwing.
 */
export async function withTiming<T>(
  service: string,
  fn: () => Promise<T>,
  extra?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);

    if (durationMs > SLOW_THRESHOLD_MS) {
      logger.warn(`Slow service call: ${service}`, { service, durationMs, ...extra });
    } else {
      logger.debug(`Service call: ${service}`, { service, durationMs, ...extra });
    }

    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    logger.error(`Service call failed: ${service}`, { service, durationMs, error, ...extra });
    throw error;
  }
}
