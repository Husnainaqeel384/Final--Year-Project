import { db } from '../db/knex.js';
import { isDemoAccount } from '../services/demo.service.js';
import { AppError } from '../utils/errors.js';
import { toAppError } from './errors.js';
import { decryptKey, encryptKey, keyHint } from './keys.js';
import { getProvider, PROVIDER_IDS, providers, suggestedModel } from './providers/index.js';

export const MODEL_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;

/** What the settings page needs. The key itself never leaves the server. */
export function listProviders() {
  return PROVIDER_IDS.map((id) => ({ id, label: providers[id].label, keysUrl: providers[id].keysUrl }));
}

const present = (row) =>
  row ? {
    provider: row.provider,
    providerLabel: getProvider(row.provider).label,
    model: row.model,
    keyHint: row.key_hint,
    updatedAt: row.updated_at,
  } : null;

export async function getSettings(userId) {
  return present(await db('ai_settings').where({ user_id: userId }).first());
}

async function savedKey(userId, providerId) {
  const row = await db('ai_settings').where({ user_id: userId, provider: providerId }).first();
  if (!row) return null;
  const key = decryptKey(row.api_key_encrypted);
  if (!key) throw new AppError('Your saved API key can no longer be read. Please add it again in Settings.');
  return key;
}

/** Checks the key by listing its models, which costs nothing, and suggests one. */
export async function listModelsFor(user, { provider: providerId, apiKey }) {
  const provider = getProvider(providerId);
  const key = apiKey ?? (await savedKey(user.id, providerId));
  if (!key) throw new AppError('Enter an API key first.');
  try {
    const models = await provider.listModels(key);
    return { models, suggested: suggestedModel(provider, models) };
  } catch (error) {
    throw toAppError(error, provider.label);
  }
}

export async function saveSettings(user, { provider: providerId, model, apiKey }) {
  const provider = getProvider(providerId);
  // Switching provider is a deliberate two-step change: the saved key has to be removed first.
  const current = await db('ai_settings').where({ user_id: user.id }).first('provider');
  if (current && current.provider !== providerId) {
    throw new AppError(`Remove your saved ${getProvider(current.provider).label} key first, then connect ${provider.label}.`, 409);
  }
  // Leaving the key out keeps the saved one, so changing only the model doesn't mean pasting it again.
  const key = apiKey ?? (await savedKey(user.id, providerId));
  if (!key) throw new AppError('Enter an API key first.');

  let models;
  try {
    models = await provider.listModels(key);
  } catch (error) {
    throw toAppError(error, provider.label);
  }
  if (!models.some((entry) => entry.id === model)) {
    throw new AppError(`${provider.label} doesn't offer "${model}" to this key. Pick a model from the list.`);
  }

  await db('ai_settings')
    .insert({ user_id: user.id, provider: providerId, model, api_key_encrypted: encryptKey(key), key_hint: keyHint(key) })
    .onConflict('user_id')
    .merge(['provider', 'model', 'api_key_encrypted', 'key_hint', 'updated_at']);
  return getSettings(user.id);
}

export async function deleteSettings(userId) {
  await db('ai_settings').where({ user_id: userId }).delete();
}

/**
 * The key, provider and model for one AI request. On the public demo the shared
 * account can't hold a key, so a visitor's own key comes with each request and
 * is used once, never stored.
 */
export async function resolveCredentials(req) {
  if (isDemoAccount(req.user)) {
    const providerId = req.get('X-AI-Provider');
    const model = req.get('X-AI-Model');
    const apiKey = req.get('X-AI-Key');
    if (!PROVIDER_IDS.includes(providerId) || !MODEL_PATTERN.test(model ?? '') || !apiKey || apiKey.length > 300) {
      throw new AppError('Add your own API key for this visit to try AI features in the demo.');
    }
    return { provider: getProvider(providerId), model, apiKey };
  }

  const row = await db('ai_settings').where({ user_id: req.user.id }).first();
  if (!row) throw new AppError('Set up AI in Settings first: choose a provider and add your API key.');
  const apiKey = decryptKey(row.api_key_encrypted);
  if (!apiKey) throw new AppError('Your saved API key can no longer be read. Please add it again in Settings.');
  return { provider: getProvider(row.provider), model: row.model, apiKey };
}
