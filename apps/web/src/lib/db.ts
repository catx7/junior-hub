/**
 * Prisma query logging middleware.
 *
 * Import this module as a side-effect to register query timing middleware:
 *   import '@/lib/db';
 *
 * Then continue using `prisma` from '@localservices/database' as normal.
 * The middleware attaches to the singleton prisma instance.
 */
import { prisma } from '@localservices/database';
import { logger } from './logger';

const SLOW_QUERY_MS = 200;

let middlewareRegistered = false;

export function registerQueryLogging() {
  if (middlewareRegistered) return;
  middlewareRegistered = true;

  prisma.$use(async (params, next) => {
    const start = performance.now();
    try {
      const result = await next(params);
      const durationMs = Math.round(performance.now() - start);

      if (durationMs > SLOW_QUERY_MS) {
        logger.warn('Slow database query', {
          model: params.model ?? 'unknown',
          operation: params.action,
          durationMs,
        });
      } else {
        logger.debug('Database query', {
          model: params.model ?? 'unknown',
          operation: params.action,
          durationMs,
        });
      }

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      logger.error('Database query failed', {
        model: params.model ?? 'unknown',
        operation: params.action,
        durationMs,
        error,
      });
      throw error;
    }
  });
}

// Auto-register on import
registerQueryLogging();
