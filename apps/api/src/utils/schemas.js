import { z } from 'zod';

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must look like 2026-03');

export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like 2026-03-31')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'That date does not exist');

const MAX_AMOUNT = 999_999_999_999.99;

export const amount = z.number().positive('Amount must be greater than zero').max(MAX_AMOUNT);
export const nonNegativeAmount = z.number().min(0, 'Amount cannot be negative').max(MAX_AMOUNT);

// Keep in sync with CURRENCIES in apps/web/src/lib/format.js.
export const currency = z.enum(['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'QAR', 'KWD', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF', 'SGD', 'MYR', 'BDT', 'TRY', 'ZAR', 'NGN']);

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  // bcrypt silently ignores everything after 72 bytes.
  .refine((value) => Buffer.byteLength(value) <= 72, 'Password is too long');

export const email = z.email('Enter a valid email address').max(255).toLowerCase();
export const requiredText = (max) => z.string().trim().min(1, 'This field is required').max(max);
