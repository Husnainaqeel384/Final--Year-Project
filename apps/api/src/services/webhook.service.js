import { createHmac, randomBytes } from 'node:crypto';
import { logger } from '../config/logger.js';
import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import { assertSafeWebhookUrl, postJson } from '../utils/safeRequest.js';

const LABELS = { slack: 'Slack', discord: 'Discord' };

/**
 * Slack and Discord each accept only their own message shape, so a Slack address
 * saved as Discord fails every time. A known address decides the destination.
 */
export function providerForUrl(rawUrl) {
  const { hostname, pathname } = new URL(rawUrl);
  if (hostname === 'hooks.slack.com') return 'slack';
  if (/(^|\.)discord(app)?\.com$/.test(hostname) && pathname.startsWith('/api/webhooks/')) return 'discord';
  return null;
}

const present = (hook) => ({
  id: hook.id,
  name: hook.name,
  provider: hook.provider,
  // The full URL often contains a secret token, so it is never sent back to the browser.
  host: new URL(hook.url).hostname,
  events: typeof hook.events === 'string' ? JSON.parse(hook.events) : hook.events,
  lastStatus: hook.last_status,
  lastDeliveredAt: hook.last_delivered_at,
});

export async function listWebhooks(workspace) {
  const hooks = await applyScope(db('webhooks'), workspace).orderBy('id', 'desc');
  return hooks.map(present);
}

export async function createWebhook(workspace, { name, provider, url, events }) {
  try {
    assertSafeWebhookUrl(url);
  } catch (error) {
    throw new AppError(error.message);
  }
  const expected = providerForUrl(url);
  if (expected && expected !== provider) {
    throw new AppError(`This is a ${LABELS[expected]} address, so choose ${LABELS[expected]} as the destination.`);
  }
  const [id] = await db('webhooks').insert({
    ...scopeColumns(workspace),
    name,
    provider,
    url,
    events: JSON.stringify(events),
    secret: randomBytes(24).toString('hex'),
  });
  return present(await db('webhooks').where({ id }).first());
}

export async function deleteWebhook(workspace, id) {
  const removed = await applyScope(db('webhooks').where({ id }), workspace).delete();
  if (!removed) throw notFound('Webhook');
}

function buildRequest(hook, event, message, data) {
  if (hook.provider === 'slack') return { body: JSON.stringify({ text: message }), headers: {} };
  if (hook.provider === 'discord') return { body: JSON.stringify({ content: message }), headers: {} };

  const body = JSON.stringify({ event, message, data, sentAt: new Date().toISOString() });
  const signature = createHmac('sha256', hook.secret).update(body).digest('hex');
  return { body, headers: { 'X-BudgetBook-Signature': `sha256=${signature}` } };
}

/** Status 0 records "could not connect" so the UI can show it. */
async function deliver(hook, event, message, data) {
  const { body, headers } = buildRequest(hook, event, message, data);
  let status = 0;
  let detail = 'Could not reach the address';
  try {
    const reply = await postJson(hook.url, body, headers);
    status = reply.status;
    detail = `The server answered with status ${status}${reply.text ? `: ${reply.text}` : ''}`;
  } catch (error) {
    logger.warn({ webhookId: hook.id, reason: error.message }, 'Webhook delivery failed');
  }
  await db('webhooks').where({ id: hook.id }).update({ last_status: status, last_delivered_at: new Date() });
  return { ok: status >= 200 && status < 300, detail };
}

export async function sendTestWebhook(workspace, id) {
  const hook = await applyScope(db('webhooks').where({ id }), workspace).first();
  if (!hook) throw notFound('Webhook');
  return deliver(hook, 'test', 'Budget Book test message: your webhook is working.', {});
}

/** Fire and forget: a slow or broken third party must never affect the user's request. */
export function emitEvent(workspace, event, message, data) {
  applyScope(db('webhooks'), workspace)
    .whereRaw('JSON_CONTAINS(events, ?)', [JSON.stringify(event)])
    .then((hooks) => Promise.allSettled(hooks.map((hook) => deliver(hook, event, message, data))))
    .catch((error) => logger.error({ err: error, event }, 'Could not dispatch webhooks'));
}
