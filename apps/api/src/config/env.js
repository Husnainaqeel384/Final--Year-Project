import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

// One .env at the repository root serves the whole monorepo. Real environment
// variables take priority, which is how Docker supplies its configuration.
dotenv.config({ path: fileURLToPath(new URL('../../../../.env', import.meta.url)), quiet: true });

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug']).default('info'),
  APP_URL: z.url().default('http://localhost:5173').transform((url) => url.replace(/\/$/, '')),
  COOKIE_SECURE: booleanString.default(false),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('root'),
  // Interpolated into CREATE DATABASE, which cannot take bound parameters.
  DB_NAME: z.string().regex(/^[A-Za-z0-9_]+$/, 'may only contain letters, numbers and underscores').default('budget_book'),
  RUN_MIGRATIONS_ON_START: booleanString.default(true),
  SEED_DEMO_DATA: booleanString.default(false),

  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('Budget Book <no-reply@example.com>'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`);
  // The logger depends on this module, so a bad configuration has to be reported directly.
  process.stderr.write(`Invalid environment configuration:\n${problems.join('\n')}\n`);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
