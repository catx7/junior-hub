/**
 * Structured JSON logger with sensitive data redaction.
 *
 * - Dev: colorized pretty-print to console
 * - Prod: single-line JSON to stdout
 * - No external dependencies
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  service?: string;
  model?: string;
  operation?: string;
  error?: unknown;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Level ordering
// ---------------------------------------------------------------------------

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getLogLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVEL_ORDER) return env as LogLevel;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

// ---------------------------------------------------------------------------
// Sensitive data redaction
// ---------------------------------------------------------------------------

const REDACTION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Bearer tokens
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: 'Bearer [REDACTED]' },
  // PostgreSQL / database connection strings
  { pattern: /postgresql:\/\/[^@\s]+@/g, replacement: 'postgresql://***:***@' },
  { pattern: /postgres:\/\/[^@\s]+@/g, replacement: 'postgres://***:***@' },
  // Firebase private key blocks
  {
    pattern: /-----BEGIN [A-Z ]+KEY-----[\s\S]*?-----END [A-Z ]+KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]',
  },
  // OpenAI / Stripe-style API keys (sk-...)
  { pattern: /sk-[A-Za-z0-9\-_]{20,}/g, replacement: '[REDACTED_API_KEY]' },
  // Firebase API keys (AIza...)
  { pattern: /AIza[A-Za-z0-9\-_]{30,}/g, replacement: '[REDACTED_FIREBASE_KEY]' },
  // Cloudinary URLs with sensitive transforms (keep domain, redact path details)
  // Generic long tokens (64+ chars of base64-like content)
  { pattern: /[A-Za-z0-9\-_+/]{64,}={0,3}/g, replacement: '[REDACTED_TOKEN]' },
];

const EMAIL_PATTERN = /([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    let result = value;
    for (const { pattern, replacement } of REDACTION_PATTERNS) {
      // Reset lastIndex for global regexes
      pattern.lastIndex = 0;
      result = result.replace(pattern, replacement);
    }
    // Partially mask emails: first char + ***@domain
    result = result.replace(EMAIL_PATTERN, '$1***@$2');
    return result;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redact(value.message) as string,
      stack: redact(value.stack) as string | undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Skip known sensitive field names entirely
      const lower = k.toLowerCase();
      if (
        lower === 'password' ||
        lower === 'token' ||
        lower === 'secret' ||
        lower === 'authorization' ||
        lower === 'cookie' ||
        lower === 'fcmtoken' ||
        lower === 'privatekey' ||
        lower === 'private_key'
      ) {
        redacted[k] = '[REDACTED]';
      } else {
        redacted[k] = redact(v);
      }
    }
    return redacted;
  }

  return value;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatError(err: unknown): Record<string, unknown> | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  if (typeof err === 'string') return { message: err };
  return { raw: String(err) };
}

function buildEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  const { error, ...rest } = context || {};
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...rest,
  };

  if (error) {
    entry.error = formatError(error);
  }

  return entry;
}

function outputDev(entry: LogEntry): void {
  const color = LEVEL_COLORS[entry.level as LogLevel] || '';
  const levelTag = `${color}[${entry.level.toUpperCase()}]${RESET}`;
  const time = entry.timestamp.split('T')[1]?.replace('Z', '') || entry.timestamp;

  const { timestamp: _, level: __, message, error, ...meta } = entry;
  const metaKeys = Object.keys(meta);

  let line = `${color}${time}${RESET} ${levelTag} ${message}`;
  if (metaKeys.length > 0) {
    const metaStr = metaKeys
      .map((k) => `${k}=${typeof meta[k] === 'object' ? JSON.stringify(meta[k]) : meta[k]}`)
      .join(' ');
    line += ` ${color}|${RESET} ${metaStr}`;
  }

  const consoleFn =
    entry.level === 'error'
      ? console.error
      : entry.level === 'warn'
        ? console.warn
        : entry.level === 'debug'
          ? console.debug
          : console.info;

  consoleFn(line);

  if (error && typeof error === 'object' && 'stack' in (error as Record<string, unknown>)) {
    consoleFn(`${color}  ↳ ${(error as Record<string, unknown>).stack}${RESET}`);
  }
}

function outputProd(entry: LogEntry): void {
  const consoleFn =
    entry.level === 'error' ? console.error : entry.level === 'warn' ? console.warn : console.log;

  consoleFn(JSON.stringify(entry));
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

function log(level: LogLevel, message: string, context?: LogContext): void {
  const minLevel = getLogLevel();
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

  const entry = buildEntry(level, message, context);
  // Redact the entire entry
  const safe = redact(entry) as LogEntry;

  if (isDev()) {
    outputDev(safe);
  } else {
    outputProd(safe);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
