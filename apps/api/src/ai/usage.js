import { db } from '../db/knex.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.js';

/**
 * Limits use rolling windows ("the last 24 hours", "the last 7 days") rather than
 * calendar days, so they are fair in every time zone and need no reset job.
 * Times are compared inside MySQL (NOW()), so the API and database clocks can't disagree.
 */
const WINDOWS = [
  { key: 'daily', hours: 24 },
  { key: 'weekly', hours: 24 * 7 },
];

export function describeWait(minutes) {
  if (minutes === null || minutes <= 1) return 'a minute';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `about ${Math.round(hours / 24)} days`;
}

export async function getLimits(userId, query = db) {
  const row = await query('ai_limits').where({ user_id: userId }).first();
  return { daily: row?.daily_limit ?? null, weekly: row?.weekly_limit ?? null };
}

/** How many requests fall in a window, and in how many minutes the oldest of them leaves it. */
async function windowState(query, userId, hours) {
  const row = await query('ai_usage')
    .where({ user_id: userId })
    .whereRaw('created_at > NOW() - INTERVAL ? HOUR', [hours])
    .first(
      query.raw('COUNT(*) AS used'),
      query.raw('TIMESTAMPDIFF(MINUTE, NOW(), MIN(created_at) + INTERVAL ? HOUR) AS frees_in', [hours]),
    );
  return { used: Number(row.used), freesIn: row.frees_in === null ? null : Number(row.frees_in) };
}

export async function usageSummary(userId) {
  const [limits, daily, weekly, totals, recent] = await Promise.all([
    getLimits(userId),
    windowState(db, userId, 24),
    windowState(db, userId, 24 * 7),
    db('ai_usage').where({ user_id: userId }).first(db.raw('COUNT(*) AS total'), db.raw('SUM(ok = 0) AS failed')),
    db('ai_usage')
      .where({ user_id: userId })
      .orderBy('id', 'desc')
      .limit(8)
      .select('id', 'feature', 'provider', 'model', 'ok', db.raw('TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago')),
  ]);

  return {
    limits,
    daily: { used: daily.used, limit: limits.daily },
    weekly: { used: weekly.used, limit: limits.weekly },
    total: Number(totals.total),
    failed: Number(totals.failed ?? 0),
    recent: recent.map((row) => ({
      id: row.id,
      feature: row.feature,
      provider: row.provider,
      model: row.model,
      ok: row.ok === null ? null : Boolean(row.ok),
      minutesAgo: Number(row.minutes_ago),
    })),
  };
}

export async function setLimits(userId, { daily, weekly }) {
  if (daily && weekly && weekly < daily) throw new AppError("The weekly limit can't be lower than the daily limit.");
  await db('ai_limits')
    .insert({ user_id: userId, daily_limit: daily, weekly_limit: weekly, updated_at: db.fn.now() })
    .onConflict('user_id')
    .merge(['daily_limit', 'weekly_limit', 'updated_at']);
  return usageSummary(userId);
}

/** Checks the limits and records the request before it goes out. Returns the usage row id. */
async function startRequest(user, workspace, { feature, provider, model }) {
  return db.transaction(async (trx) => {
    // Locking the person's row makes their simultaneous requests take turns,
    // so a burst of clicks can't slip past the limit.
    await trx('users').where({ id: user.id }).forUpdate().first('id');
    const limits = await getLimits(user.id, trx);

    for (const window of WINDOWS) {
      const limit = limits[window.key];
      if (limit === null) continue;
      const state = await windowState(trx, user.id, window.hours);
      if (state.used >= limit) {
        throw new AppError(
          `You've reached your ${window.key} AI limit of ${limit} ${limit === 1 ? 'request' : 'requests'}. ` +
            `The next one frees up in ${describeWait(state.freesIn)}. You can change your limits in Settings.`,
          429,
        );
      }
    }

    const [id] = await trx('ai_usage').insert({
      user_id: user.id,
      organization_id: workspace.organizationId,
      feature,
      provider: provider.id,
      model,
    });
    return id;
  });
}

/**
 * Credentials whose `generate` counts each request against the person's limits.
 * Every request that reaches the provider is counted, even a failed one, because
 * the provider may still bill for it. Problems caught before sending are not.
 */
export function metered(credentials, req, feature) {
  return {
    ...credentials,
    async generate(params) {
      const id = await startRequest(req.user, req.workspace, {
        feature,
        provider: credentials.provider,
        model: credentials.model,
      });
      try {
        const result = await credentials.provider.generateJson({ apiKey: credentials.apiKey, model: credentials.model, ...params });
        await db('ai_usage').where({ id }).update({ ok: true });
        return result;
      } catch (error) {
        await db('ai_usage').where({ id }).update({ ok: false });
        // What the provider said, so a failure can be diagnosed. Never the key or the content sent.
        logger.warn(
          { provider: credentials.provider.id, model: credentials.model, feature, kind: error.kind, detail: error.message },
          'AI request failed',
        );
        throw error;
      }
    },
  };
}
