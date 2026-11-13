import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const options = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  // The integration tests make many sign-ins from one address.
  skip: () => env.NODE_ENV === 'test',
};

export const apiLimiter = rateLimit({ ...options, windowMs: 60 * 1000, limit: 300 });

/** Strict because these endpoints are the targets of password guessing and email flooding. */
export const authLimiter = rateLimit({ ...options, windowMs: 15 * 60 * 1000, limit: 30 });

export const feedLimiter = rateLimit({ ...options, windowMs: 60 * 1000, limit: 30 });
