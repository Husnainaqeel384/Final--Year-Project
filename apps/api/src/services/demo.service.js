import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { db } from '../db/knex.js';
import { DEMO_EMAILS, DEMO_LOGIN_EMAIL, resetDemoData } from '../../seeds/demo.js';
import { AppError } from '../utils/errors.js';

// 03:00 UTC is the quietest hour for visitors from Europe through Asia.
const RESET_HOUR_UTC = 3;

/** Read at call time, not import time, so tests can switch demo mode on. */
export const isDemoAccount = (user) => env.DEMO_MODE && DEMO_EMAILS.includes(user.email);

export async function findDemoUser() {
  const user = await db('users').where({ email: DEMO_LOGIN_EMAIL }).first();
  // Only missing if someone removed it by hand; the nightly reset brings it back.
  if (!user) throw new AppError('The demo is being reset. Please try again in a minute.', 503);
  return user;
}

export function msUntilNextReset(now = new Date()) {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), RESET_HOUR_UTC));
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next - now;
}

/**
 * Resets the demo every night so one visitor's changes don't greet the next,
 * and so the sample dates (bills due soon, this month's spending) stay current.
 * A timer rather than a cron package: one job a day doesn't justify a dependency.
 */
export function scheduleDemoReset() {
  let timer;
  const plan = () => {
    timer = setTimeout(async () => {
      try {
        await resetDemoData();
      } catch (error) {
        logger.error({ err: error }, 'The nightly demo reset failed');
      }
      plan();
    }, msUntilNextReset());
  };
  plan();
  return () => clearTimeout(timer);
}
