import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  // A last safety net: these must never reach log files, even if logged by mistake.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      // A demo visitor's own AI key travels in this header for the length of their visit.
      'req.headers["x-ai-key"]',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.apiKey',
    ],
    censor: '[redacted]',
  },
  // Readable output for developers; structured JSON for log collectors in production.
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } }
      : undefined,
});
