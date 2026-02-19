/**
 * Higher-order function that wraps Next.js API route handlers with
 * structured logging, request tracing, and performance metrics.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { serverErrorResponse } from './auth-middleware';

type RouteContext = { params: Record<string, string> };

type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

interface WithLoggingOptions {
  /** Route label for logs, e.g. '/api/jobs' */
  route?: string;
}

/**
 * Wraps a route handler to automatically:
 * - Generate a requestId for tracing
 * - Measure and log response time
 * - Catch unhandled errors with structured logging
 * - Add X-Request-Id header to responses
 */
export function withLogging(handler: RouteHandler, options?: WithLoggingOptions): RouteHandler {
  return async (request: NextRequest, context: RouteContext) => {
    const requestId = crypto.randomUUID();
    const start = performance.now();
    const method = request.method;
    const route = options?.route || new URL(request.url).pathname;

    try {
      const response = await handler(request, context);
      const durationMs = Math.round(performance.now() - start);
      const status = response.status;

      // Log at appropriate level based on status
      if (status >= 500) {
        logger.error('Request completed with server error', {
          requestId,
          route,
          method,
          status,
          durationMs,
        });
      } else if (status >= 400) {
        logger.warn('Request completed with client error', {
          requestId,
          route,
          method,
          status,
          durationMs,
        });
      } else {
        logger.info('Request completed', {
          requestId,
          route,
          method,
          status,
          durationMs,
        });
      }

      // Attach requestId header for client-side tracing
      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);

      logger.error('Unhandled route error', {
        requestId,
        route,
        method,
        durationMs,
        error,
      });

      const res = serverErrorResponse();
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
  };
}
